'use client';

import { RegisterForm } from '@/components/auth/RegistrationForm';
import { motion } from 'framer-motion';

export default function RegisterPage() {
    return (
        <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <RegisterForm />
            </motion.div>
        </div>
    );
}