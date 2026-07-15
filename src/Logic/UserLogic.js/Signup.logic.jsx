import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AiOutlineEye, AiOutlineEyeInvisible } from "../../components/icons";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth";
import { createAvatarUrl } from "../../lib/avatar";
import { useUser } from "../../context/userContext";

function SignupLogic() {
  const [showPass, setShowPass] = useState(false);
  const [showCPass, setShowCPass] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [CPassword, setCPassword] = useState("");
  const [validateMessage, setValidateMessage] = useState(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUserInfo } = useUser();

  const inputs = [
    {
      label: "Name",
      name: "name",
      placeholder: "Enter Your Name",
      value: name,
      cb: setName,
      required: true,
    },
    {
      label: "Email",
      name: "email",
      placeholder: "Enter Your Email",
      value: email,
      type: "email",
      cb: setEmail,
      required: true,
    },
    {
      label: "Password",
      name: "password",
      placeholder: "Please pick a strong password",
      value: password,
      cb: setPassword,
      type: !showPass ? "password" : "text",
      required: true,
      rightIcon: (
        <button
          onClick={(e) => {
            e?.preventDefault();
            setShowPass((prev) => !prev);
          }}
        >
          {showPass ? (
            <AiOutlineEye size={24} />
          ) : (
            <AiOutlineEyeInvisible size={24} />
          )}
        </button>
      ),
    },
    {
      label: "Confirm Password",
      placeholder: "Please retype password",
      name: "cpassword",
      value: CPassword,
      cb: setCPassword,
      required: true,
      type: !showCPass ? "password" : "text",
      rightIcon: (
        <button
          onClick={(e) => {
            e?.preventDefault();
            setShowCPass((prev) => !prev);
          }}
        >
          {showCPass ? (
            <AiOutlineEye size={24} />
          ) : (
            <AiOutlineEyeInvisible size={24} />
          )}
        </button>
      ),
    },
  ];

  const signupMutation = useMutation({
    mutationFn: async () => {
      const res = await authService.signup(name, email, password, createAvatarUrl());
      if (!res.ok) throw new Error(res.error || "Sign up failed");
      return res.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", JSON.stringify(data.token));
      localStorage.setItem("Mahotsav-user", JSON.stringify(data.user));
      setUserInfo(data.user);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Signed up successfully");
      navigate("/dashboard", { replace: true });
    },
    onError: (err) => {
      setValidateMessage(err.message);
      toast.error(err.message);
    },
  });

  const signUpUser = (e) => {
    e?.preventDefault();
    if (!name || !email || !password || !CPassword) {
      toast.error("Please fill all fields");
      setValidateMessage("Please fill all fields");
      return;
    }
    if (password !== CPassword) {
      toast.error("Passwords do not match");
      setValidateMessage("Passwords do not match");
      return;
    }
    setValidateMessage(null);
    signupMutation.mutate();
  };

  return {
    inputs,
    validateMessage,
    signingin: signupMutation.isPending,
    setValidateMessage,
    showPass,
    setShowCPass,
    showCPass,
    setShowPass,
    email,
    setEmail,
    name,
    setName,
    password,
    setPassword,
    CPassword,
    setCPassword,
    signUpUser,
  };
}

export default SignupLogic;
