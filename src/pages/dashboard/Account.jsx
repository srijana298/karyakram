import React, { useEffect, useState } from "react";
import Avatar from "../../components/Avatar";
import Input from "../../components/Input";
import { MdVerified } from "react-icons/md";
import { toast } from "react-hot-toast";
import Button from "../../components/Button";
import { useUser } from "../../context/userContext";
import { authService } from "../../services/auth";

function Account() {
  const [loading, setLoading] = useState(false);
  const [updateFields, setUpdateFields] = useState(false);
  const { userInfo, setUserInfo } = useUser();

  const {
    name: userName,
    email: userEmail,
    phone: userPhone,
  } = userInfo || {};

  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [phone, setPhone] = useState(userPhone);

  const inputFields = [
    { label: "Name", type: "text", name: "name", value: name, cb: setName, disabled: !updateFields, required: true },
    { label: "Email", type: "email", name: "email", value: email, cb: setEmail, disabled: true },
    { label: "Phone", type: "tel", name: "phone", value: phone, cb: setPhone, disabled: true },
  ];

  const revalidateFields = () => {
    const user = JSON.parse(localStorage.getItem("Karyakram-user"));
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
      setUserInfo(user);
    }
  };

  const handleUpdateFields = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (name !== userName) {
      const res = await authService.updateMe({ name, phone });
      if (res.ok) {
        toast.success("Name updated successfully!");
        localStorage.setItem("Karyakram-user", JSON.stringify(res.data));
        setUserInfo(res.data);
        revalidateFields();
      } else {
        toast.error(res.error);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!updateFields) {
      setName(userName);
      setEmail(userEmail);
      setPhone(userPhone);
    }
  }, [updateFields, userName, userEmail, userPhone]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-4 ">
      <Avatar size={"text-3xl"} name={userName} />
      <h1 className="page-title">Hello, {userName}</h1>
      <form onSubmit={handleUpdateFields} className="flex flex-col gap-4 w-full max-w-[400px]">
        {inputFields?.map((field, index) => (
          <Input key={index} {...field} show={true} />
        ))}
        <button
          className="rounded-[18px] bg-neutral-300 mt-2 p-4 outline outline-1 outline-neutral-300"
          onClick={(e) => {
            e.preventDefault();
            setUpdateFields((prev) => !prev);
          }}
        >
          {updateFields ? "Cancel" : "Edit"}
        </button>
        {updateFields && (
          <Button type="submit" className="primary-btn" style="mt-0" text={"Save"} disabled={!updateFields} loading={loading} />
        )}
      </form>
    </div>
  );
}

export default Account;
