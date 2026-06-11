import { cookies }     from 'next/headers';
import type { Metadata } from 'next';
import type { Locale }  from '@/lib/i18n';

export const metadata: Metadata = { title: 'Điều khoản Sử dụng | Tuto' };

export default async function TermsPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('tuto_lang')?.value === 'en' ? 'en' : 'vi';
  const isVi = locale === 'vi';

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose prose-sm md:prose-base prose-headings:text-on-surface prose-p:text-muted">
      {isVi ? <TermsVi /> : <TermsEn />}
    </article>
  );
}

function TermsVi() {
  return (
    <>
      <h1>Điều khoản Sử dụng</h1>
      <p><em>Cập nhật lần cuối: tháng 6 năm 2026</em></p>

      <p>
        Bằng cách truy cập hoặc sử dụng các dịch vụ của Tuto (bao gồm tutoglobal.com, tuto.asia,
        school.tuto.asia và pro.tuto.asia), bạn đồng ý tuân theo các điều khoản này.
      </p>

      <h2>1. Miễn phí triển khai cho trường học</h2>
      <p>
        Tuto hiện cung cấp miễn phí hoàn toàn dịch vụ triển khai và sử dụng nền tảng
        cho các trường học và trung tâm giáo dục. <strong>Ưu đãi này có thời hạn</strong> và
        áp dụng trong giai đoạn ra mắt sản phẩm. Tuto <strong>bảo lưu quyền tính phí cho
        một số dịch vụ trong tương lai</strong> sau khi thông báo trước cho người dùng.
        Việc tiếp tục sử dụng nền tảng sau khi có thông báo thay đổi giá coi là chấp nhận
        các điều khoản mới.
      </p>

      <h2>2. Tài khoản người dùng</h2>
      <p>
        Bạn chịu trách nhiệm về tính bảo mật của tài khoản và tất cả hoạt động diễn ra
        dưới tài khoản của mình. Không được chia sẻ thông tin đăng nhập với người khác.
      </p>

      <h2>3. Nội dung người dùng</h2>
      <p>
        Bạn giữ quyền sở hữu nội dung bạn đăng. Bằng cách đăng tải, bạn cấp Tuto quyền
        lưu trữ và hiển thị nội dung đó trong phạm vi dịch vụ. Tuto sử dụng AI để kiểm
        duyệt nội dung trước khi hiển thị công khai.
      </p>

      <h2>4. Hành vi bị cấm</h2>
      <ul>
        <li>Đăng nội dung vi phạm pháp luật, xúc phạm, hoặc có hại cho trẻ em.</li>
        <li>Giả mạo danh tính người khác.</li>
        <li>Cố gắng truy cập trái phép vào hệ thống hoặc dữ liệu của người dùng khác.</li>
        <li>Spam, quảng cáo không được yêu cầu.</li>
      </ul>

      <h2>5. Giới hạn trách nhiệm</h2>
      <p>
        Tuto không đảm bảo tính liên tục không gián đoạn của dịch vụ. Tuto không chịu
        trách nhiệm cho bất kỳ thiệt hại gián tiếp nào phát sinh từ việc sử dụng dịch vụ.
      </p>

      <h2>6. Thay đổi điều khoản</h2>
      <p>
        Chúng tôi có thể cập nhật các điều khoản này. Thay đổi quan trọng sẽ được thông
        báo qua email đã đăng ký hoặc thông báo trong ứng dụng.
      </p>

      <h2>7. Liên hệ</h2>
      <p>hello@tuto.asia</p>
    </>
  );
}

function TermsEn() {
  return (
    <>
      <h1>Terms of Use</h1>
      <p><em>Last updated: June 2026</em></p>

      <p>
        By accessing or using Tuto services (including tutoglobal.com, tuto.asia,
        school.tuto.asia, and pro.tuto.asia), you agree to these terms.
      </p>

      <h2>1. Free Setup for Schools</h2>
      <p>
        Tuto currently provides completely free deployment and use of the platform for
        schools and educational centers. <strong>This offer is time-limited</strong> and
        applies during the product launch phase. Tuto <strong>reserves the right to charge
        for some services in the future</strong> with advance notice to users. Continued use
        of the platform after a pricing change notice constitutes acceptance of the new terms.
      </p>

      <h2>2. User Accounts</h2>
      <p>
        You are responsible for the security of your account and all activity under it.
        Do not share login credentials with others.
      </p>

      <h2>3. User Content</h2>
      <p>
        You retain ownership of content you post. By posting, you grant Tuto the right to
        store and display that content within the service. Tuto uses AI to moderate content
        before public display.
      </p>

      <h2>4. Prohibited Conduct</h2>
      <ul>
        <li>Posting illegal, offensive, or harmful content, especially content harmful to minors.</li>
        <li>Impersonating another person.</li>
        <li>Attempting unauthorised access to systems or other users&apos; data.</li>
        <li>Spam or unsolicited advertising.</li>
      </ul>

      <h2>5. Limitation of Liability</h2>
      <p>
        Tuto does not guarantee uninterrupted service availability. Tuto is not liable for
        any indirect damages arising from use of the service.
      </p>

      <h2>6. Changes to Terms</h2>
      <p>
        We may update these terms. Material changes will be communicated via registered
        email or in-app notification.
      </p>

      <h2>7. Contact</h2>
      <p>hello@tuto.asia</p>
    </>
  );
}
