import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { email, otp, newPassword } = await req.json();

        const user = await prisma.user.findUnique({ where: { email } });

        if (
            !user ||
            user.resetOtp !== otp ||
            !user.resetOtpExpiry ||
            user.resetOtpExpiry < new Date()
        ) {
            return NextResponse.json(
                { error: "Invalid or expired OTP code." },
                { status: 400 }
            );
        }

        // 2. Naye password ko hash karein
        const hashedPassword = await hash(newPassword, 12);

        // 3. Database mein naya password save karein aur purana OTP clear kar dein
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                resetOtp: null,
                resetOtpExpiry: null,
            },
        });

        return NextResponse.json({ message: "Password reset successful! You can now login." });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
    }
}