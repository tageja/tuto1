import { cookies }     from 'next/headers';
import type { Metadata } from 'next';
import type { Locale }  from '@/lib/i18n';

export const metadata: Metadata = { title: 'Chính sách Bảo mật | Tuto' };

export default async function PrivacyPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('tuto_lang')?.value === 'en' ? 'en' : 'vi';
  const isVi = locale === 'vi';

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose prose-sm md:prose-base prose-headings:text-on-surface prose-p:text-muted">
      {isVi ? <PrivacyVi /> : <PrivacyEn />}
    </article>
  );
}

function PrivacyVi() {
  return (
    <>
      <h1>Chính sách Bảo mật</h1>
      <p><em>Cập nhật lần cuối: tháng 6 năm 2026</em></p>

      <h2>1. Dữ liệu chúng tôi thu thập</h2>
      <ul>
        <li><strong>Thông tin tài khoản:</strong> tên, email, số điện thoại, vai trò (giáo viên/phụ huynh/học sinh).</li>
        <li><strong>Nội dung người dùng:</strong> bài đăng, bình luận, ảnh bạn tải lên.</li>
        <li><strong>Dữ liệu trường học:</strong> thông tin lớp học, điểm danh, bài tập (chỉ áp dụng cho tài khoản trường học).</li>
        <li><strong>Dữ liệu sử dụng:</strong> thông tin truy cập ẩn danh để cải thiện sản phẩm.</li>
      </ul>

      <h2>2. Dữ liệu được lưu ở đâu</h2>
      <p>
        Tất cả dữ liệu được lưu trữ trên Supabase (PostgreSQL) tại trung tâm dữ liệu đặt
        ở Singapore hoặc khu vực Đông Nam Á. Chúng tôi sử dụng Row Level Security (RLS)
        để đảm bảo mỗi người dùng chỉ truy cập được dữ liệu của mình.
      </p>

      <h2>3. Chúng tôi không bán dữ liệu</h2>
      <p>
        Tuto không bán, cho thuê hoặc chia sẻ dữ liệu cá nhân của bạn với bên thứ ba
        vì mục đích thương mại. Dữ liệu chỉ được chia sẻ khi cần thiết để cung cấp
        dịch vụ (ví dụ: gửi email qua Resend) hoặc theo yêu cầu pháp lý.
      </p>

      <h2>4. Bảo mật trẻ em</h2>
      <p>
        Dữ liệu học sinh chưa thành niên được xử lý theo quy định bảo vệ dữ liệu trẻ em.
        Phụ huynh có thể yêu cầu xem hoặc xóa dữ liệu của con em bất kỳ lúc nào.
      </p>

      <h2>5. Quyền của bạn</h2>
      <ul>
        <li>Quyền truy cập và xuất dữ liệu của bạn.</li>
        <li>Quyền yêu cầu xóa tài khoản và dữ liệu liên quan.</li>
        <li>Quyền sửa thông tin không chính xác.</li>
      </ul>

      <h2>6. Liên hệ</h2>
      <p>
        Mọi câu hỏi về quyền riêng tư: <a href="mailto:hello@tuto.asia">hello@tuto.asia</a>
      </p>
    </>
  );
}

function PrivacyEn() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p><em>Last updated: June 2026</em></p>

      <h2>1. Data We Collect</h2>
      <ul>
        <li><strong>Account information:</strong> name, email, phone, role (teacher/parent/student).</li>
        <li><strong>User content:</strong> posts, comments, photos you upload.</li>
        <li><strong>School data:</strong> class information, attendance, homework (school accounts only).</li>
        <li><strong>Usage data:</strong> anonymous access information for product improvement.</li>
      </ul>

      <h2>2. Where Data is Stored</h2>
      <p>
        All data is stored on Supabase (PostgreSQL) in Singapore or Southeast Asia data
        centres. We use Row Level Security (RLS) to ensure each user can only access
        their own data.
      </p>

      <h2>3. We Do Not Sell Data</h2>
      <p>
        Tuto does not sell, rent or share your personal data with third parties for
        commercial purposes. Data is only shared when necessary to provide the service
        (e.g. sending emails via Resend) or when required by law.
      </p>

      <h2>4. Child Safety</h2>
      <p>
        Minor student data is handled in accordance with child data protection regulations.
        Parents can request to view or delete their child&apos;s data at any time.
      </p>

      <h2>5. Your Rights</h2>
      <ul>
        <li>Right to access and export your data.</li>
        <li>Right to request account and data deletion.</li>
        <li>Right to correct inaccurate information.</li>
      </ul>

      <h2>6. Contact</h2>
      <p>
        Privacy questions: <a href="mailto:hello@tuto.asia">hello@tuto.asia</a>
      </p>
    </>
  );
}
