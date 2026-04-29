import React from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";

function VerifyEmail() {
  // Email verification removed — redirect to dashboard
  const navigate = useNavigate();
  navigate("/dashboard/account");
  return null;
}

export default VerifyEmail;
