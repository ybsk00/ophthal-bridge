"use client";

import ChatInterface from "@/components/chat/ChatInterface";
import { Suspense } from "react";

export default function EyeCarePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-skin-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-skin-primary"></div>
            </div>
        }>
            <ChatInterface mode="healthcare" isLoggedIn={false} />
        </Suspense>
    );
}
