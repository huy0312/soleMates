package com.solemates.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Async("taskExecutor")
    public void sendVerificationEmail(String toEmail, String token) {
        System.out.println("Sending email from thread: " + Thread.currentThread().getName());
        String subject = "Xác nhận đăng ký tài khoản Solemates";
        String confirmationUrl = "http://localhost:8080/api/auth/verify?token=" + token;

        String htmlContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;\">"
                +
                "    <h2 style=\"color: #6d28d9; text-align: center;\">Chào mừng đến với Solemates!</h2>" +
                "    <p>Xin chào,</p>" +
                "    <p>Cảm ơn bạn đã đăng ký tham gia cộng đồng chạy bộ Solemates. Để bắt đầu hành trình, vui lòng xác thực tài khoản của bạn bằng cách nhấn vào nút bên dưới:</p>"
                +
                "    <div style=\"text-align: center; margin: 30px 0;\">" +
                "        <a href=\"" + confirmationUrl
                + "\" style=\"background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;\">Xác thực Tài khoản</a>"
                +
                "    </div>" +
                "    <p>Hoặc truy cập đường dẫn sau: <br><a href=\"" + confirmationUrl + "\" style=\"color: #6d28d9;\">"
                + confirmationUrl + "</a></p>" +
                "    <p>Đường dẫn này sẽ hết hạn sau 24 giờ.</p>" +
                "    <hr style=\"border: none; border-top: 1px solid #eee; margin: 20px 0;\">" +
                "    <p style=\"font-size: 12px; color: #888; text-align: center;\">© 2026 Solemates Running Club. All rights reserved.</p>"
                +
                "</div>";

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            helper.setFrom("noreply@solemates.com");

            javaMailSender.send(message);
            System.out.println("Email sent successfully!");
        } catch (MessagingException e) {
            System.err.println("Failed to send email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
