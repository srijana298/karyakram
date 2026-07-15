import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AiOutlineEye, AiOutlineEyeInvisible } from "../../components/icons";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth";

function LoginLogic() {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validateMessage, setValidateMessage] = useState(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const inputs = [
    {
      label: "Email",
      placeholder: "example@email.com",
      value: email,
      cb: setEmail,
      type: "email",
    },
    {
      label: "Password",
      placeholder: "Please pick a strong password",
      value: password,
      cb: setPassword,
      inputMode: "text",
      keyboard: "default",
      type: !showPass ? "password" : "text",
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
  ];

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await authService.login(email, password);
      if (!res.ok) throw new Error(res.error || "Login failed");
      return res.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", JSON.stringify(data.token));
      localStorage.setItem("Mahotsav-user", JSON.stringify(data.user));
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Logged in successfully");
      navigate("/dashboard", { replace: true });
    },
    onError: (err) => {
      setValidateMessage(err.message);
      toast.error(err.message);
    },
  });

  const loginUser = (e) => {
    e?.preventDefault();
    setValidateMessage(null);
    loginMutation.mutate();
  };

  return {
    inputs,
    validateMessage,
    signingin: loginMutation.isPending,
    setValidateMessage,
    showPass,
    setShowPass,
    email,
    setEmail,
    password,
    setPassword,
    loginUser,
  };
}

export default LoginLogic;
