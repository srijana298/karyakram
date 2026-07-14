import React from 'react';
import LoginLogic from '../../Logic/UserLogic.js/Login.logic';
import Input from '../../components/Input';
import { Button } from '@/components/ui/button';

function Login() {
  const { inputs, loginUser } = LoginLogic();

  return (
    <form onSubmit={loginUser} className="w-full">
      {inputs.map((input, index) => (
        <Input {...input} show={true} />
      ))}
      <Button type={'submit'}>Sign In</Button>
    </form>
  );
}

export default Login;
