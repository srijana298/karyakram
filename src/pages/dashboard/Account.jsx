import React, { useEffect, useState } from "react";
import Avatar from "../../components/Avatar";
import Input from "../../components/Input";
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
    const user = JSON.parse(localStorage.getItem("Mahotsav-user"));
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
        localStorage.setItem("Mahotsav-user", JSON.stringify(res.data));
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
    <div className="flex flex-col items-center justify-center h-full w-full gap-4 py-8">
      <Avatar size={"text-2xl w-14 h-14"} name={userName} />
      <h1 className="text-xl font-bold text-secondary">Hello, {userName}</h1>
      <form onSubmit={handleUpdateFields} className="flex flex-col gap-4 w-full max-w-sm mt-4">
        {inputFields?.map((field, index) => (
          <Input key={index} {...field} show={true} />
        ))}
        <button
          type="button"
          className="rounded-xl bg-neutral-100 border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition-colors"
          onClick={(e) => {
            e.preventDefault();
            setUpdateFields((prev) => !prev);
          }}
        >
          {updateFields ? "Cancel" : "Edit Profile"}
        </button>
        {updateFields && (
          <Button type="submit" text="Save" style="my-0" disabled={!updateFields} loading={loading} />
        )}
      </form>
    </div>
  );
}

export default Account;
