import React from 'react';
import { Button as ShadcnButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Button = ({ text, type, cb, loading, style, variant = 'primary' }) => (
  <ShadcnButton
    type={type}
    disabled={loading}
    variant={variant === 'neutral' || variant === 'primary' ? 'default' : variant}
    onClick={cb}
  >
    {loading ? 'Processing...' : text}
  </ShadcnButton>
);

export default Button;
