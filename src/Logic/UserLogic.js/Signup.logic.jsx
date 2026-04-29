import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth";

function SignupLogic() {
  const [showPass, setShowPass] = useState(false);
  const [showCPass, setShowCPass] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [CPassword, setCPassword] = useState("");
  const [validateMessage, setValidateMessage] = useState(null);
  const [signingin, setSigningin] = useState(false);

  const navigate = useNavigate();

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

  const signUpUser = async (e) => {
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
    setSigningin(true);
    setValidateMessage(null);

    const res = await authService.signup(name, email, password);

    if (!res.ok) {
      setValidateMessage(res.error);
      toast.error(res.error);
      setSigningin(false);
      return;
    }

    localStorage.setItem("token", JSON.stringify(res.data.token));
    localStorage.setItem("Karyakram-user", JSON.stringify(res.data.user));
    toast.success("Signed up successfully");
    navigate("/dashboard", { replace: true });
    setSigningin(false);
  };

  return {
    inputs,
    validateMessage,
    signingin,
    setSigningin,
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
