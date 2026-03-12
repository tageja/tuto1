/**
 * NurseMed Emergency Nursing Communication - Module 9
 * "Simulation and Emergency Review"
 *
 * Module 9 teaches post-emergency debrief language, what went well/what to
 * improve, learning from clinical events, and discussing near-misses professionally.
 *
 * 8 Lessons: Heads Up → Heads Down → Heads Together → Assessment
 * Module shell ALREADY EXISTS — do NOT insert into nursed_modules.
 */

import { getServiceClient } from '../supabase'

export async function seedModule9(moduleId: string) {
  const db = getServiceClient()

  const { data: existingLessons } = await db.from('nursed_lessons').select('id').eq('module_id', moduleId)
  for (const l of existingLessons ?? []) {
    await db.from('nursed_lesson_steps').delete().eq('lesson_id', l.id)
  }
  await db.from('nursed_lessons').delete().eq('module_id', moduleId)

  const lessons = [
    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 1 — HEADS UP  (scenario_intro → audio_shadow → script_read → quiz)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Team Debrief After Resuscitation',
      title_vi: 'Họp Rút kinh nghiệm Sau Hồi sức',
      description: 'A resuscitation has just ended. Learn the language nurses use to debrief professionally and learn from the event.',
      description_vi: 'Hồi sức vừa kết thúc. Học ngôn ngữ điều dưỡng dùng để rút kinh nghiệm chuyên nghiệp và học từ sự kiện.',
      stage: 'heads_up',
      order_index: 1,
      est_minutes: 12,
      objective: 'Identify key debrief phrases used after emergencies.',
      steps: [
        {
          type: 'scenario_intro',
          title: 'Resuscitation Room — Post-Code Debrief',
          title_vi: 'Phòng Hồi sức — Rút kinh nghiệm Sau Code',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            setting_en: 'Resuscitation Room — Post-Code',
            setting_vi: 'Phòng Hồi sức — Sau Code',
            context_en: 'The team has just finished a cardiac arrest. The patient has been stabilised and transferred to ICU. The team leader calls a brief debrief. You want to contribute and learn. How do you ask what went well and what could improve?',
            context_vi: 'Đội vừa hoàn thành ngừng tim. Bệnh nhân đã ổn định và chuyển ICU. Trưởng đội gọi rút kinh nghiệm ngắn. Bạn muốn đóng góp và học hỏi. Bạn hỏi thế nào về điều tốt và điều cần cải thiện?',
            key_phrases: [
              { en: 'What went well in that situation?', vi: 'Điều gì đã diễn ra tốt trong tình huống đó?' },
              { en: 'One thing I would do differently is...', vi: 'Một điều tôi sẽ làm khác đi là...' },
              { en: 'I wanted to check my decision with you.', vi: 'Tôi muốn kiểm tra quyết định của tôi với bạn.' },
              { en: 'This was a learning experience for the whole team.', vi: 'Đây là trải nghiệm học hỏi cho cả đội.' },
              { en: 'Could you give me feedback on my communication?', vi: 'Bạn có thể cho tôi phản hồi về giao tiếp của tôi không?' },
            ],
            _instructions: 'AUDIO PRODUCER: 15-20 sec post-resuscitation ambient — quiet, reflective. No dialogue. Mood: reflective, professional.',
          },
        },
        {
          type: 'audio_shadow',
          title: 'Listen & Repeat: Debrief Language',
          title_vi: 'Nghe & Lặp lại: Ngôn ngữ Rút kinh nghiệm',
          order_index: 2,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Team Leader: Let's do a quick debrief. What went well in that situation?\nNurse Lan: I think the CPR was started quickly. The defibrillator arrived within two minutes.\nTeam Leader: Good. What could we improve?\nNurse Lan: One thing I would do differently is — I could have called for help a bit earlier. I wanted to check my decision with you. This was a learning experience for the whole team.\nTeam Leader: Thank you. Could you give me feedback on my communication? I want to know if my instructions were clear.\nNurse Lan: Yes, they were clear. I knew what to do.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Team Leader (male, calm, reflective), Nurse Lan (female, Vietnamese accent OK, thoughtful). Post-resuscitation room. Duration: 38-42 sec. Speed: 0.8x slow.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the Debrief Dialogue',
          title_vi: 'Đọc Hội thoại Rút kinh nghiệm',
          order_index: 3,
          config: {
            script: "Team Leader: What went well in that situation?\nNurse Lan: The CPR was started quickly. The defibrillator arrived within two minutes.\nTeam Leader: What could we improve?\nNurse Lan: One thing I would do differently is — I could have called for help earlier. This was a learning experience for the whole team.\nTeam Leader: Could you give me feedback on my communication?\nNurse Lan: Yes, your instructions were clear.",
          },
        },
        {
          type: 'quiz',
          title: 'Check Your Understanding',
          title_vi: 'Kiểm tra Hiểu biết của Bạn',
          order_index: 4,
          config: {
            questions: [
              {
                id: 'm9l1q1',
                type: 'mcq',
                prompt_en: 'What does "What went well in that situation?" achieve?',
                prompt_vi: '"What went well in that situation?" đạt được gì?',
                options: [
                  { id: 'a', text: 'It criticises the team.', text_vi: 'Nó chỉ trích đội.' },
                  { id: 'b', text: 'It opens a safe space to reflect on positives first — builds learning culture.', text_vi: 'Nó mở không gian an toàn để phản ánh điều tích cực trước — xây dựng văn hóa học hỏi.' },
                  { id: 'c', text: 'It means the situation was good.', text_vi: 'Nó có nghĩa tình huống tốt.' },
                  { id: 'd', text: 'Only the team leader can say this.', text_vi: 'Chỉ trưởng đội mới nói được.' },
                ],
                answer: 'b',
                explanation_en: 'Starting with "what went well" creates psychological safety before discussing improvements.',
                explanation_vi: 'Bắt đầu với "what went well" tạo an toàn tâm lý trước khi thảo luận cải thiện.',
              },
              {
                id: 'm9l1q2',
                type: 'mcq',
                prompt_en: '"One thing I would do differently is" — what does this phrase show?',
                prompt_vi: '"One thing I would do differently is" — cụm từ này thể hiện gì?',
                options: [
                  { id: 'a', text: 'The nurse is blaming others.', text_vi: 'Điều dưỡng đang đổ lỗi người khác.' },
                  { id: 'b', text: 'Self-reflection and willingness to learn — professional and constructive.', text_vi: 'Tự phản ánh và sẵn sàng học hỏi — chuyên nghiệp và xây dựng.' },
                  { id: 'c', text: 'The nurse made a mistake.', text_vi: 'Điều dưỡng đã mắc lỗi.' },
                  { id: 'd', text: 'The nurse wants to leave.', text_vi: 'Điều dưỡng muốn rời đi.' },
                ],
                answer: 'b',
                explanation_en: 'This phrase shows self-awareness and openness to improvement — key for debrief culture.',
                explanation_vi: 'Cụm từ này thể hiện tự nhận thức và cởi mở với cải thiện — quan trọng cho văn hóa rút kinh nghiệm.',
              },
              {
                id: 'm9l1q3',
                type: 'mcq',
                prompt_en: '"Could you give me feedback on my communication?" — when is this appropriate?',
                prompt_vi: '"Could you give me feedback on my communication?" — khi nào phù hợp?',
                options: [
                  { id: 'a', text: 'Only when you made a big mistake.', text_vi: 'Chỉ khi bạn mắc lỗi lớn.' },
                  { id: 'b', text: 'After any clinical event when you want to improve — shows professionalism.', text_vi: 'Sau bất kỳ sự kiện lâm sàng nào khi bạn muốn cải thiện — thể hiện chuyên nghiệp.' },
                  { id: 'c', text: 'Never — it shows weakness.', text_vi: 'Không bao giờ — nó thể hiện yếu đuối.' },
                  { id: 'd', text: 'Only in private.', text_vi: 'Chỉ riêng tư.' },
                ],
                answer: 'b',
                explanation_en: 'Asking for feedback shows growth mindset and is valued in healthcare teams.',
                explanation_vi: 'Xin phản hồi thể hiện tư duy phát triển và được đánh giá cao trong đội ngũ y tế.',
              },
            ],
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 2 — HEADS UP  (audio_shadow → script_read → cloze → quiz)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Discussing a Near-Miss with a Supervisor',
      title_vi: 'Thảo luận Suýt Sai với Giám sát viên',
      description: 'You were involved in a near-miss. Learn how to discuss it professionally with your supervisor.',
      description_vi: 'Bạn tham gia vào một suýt sai. Học cách thảo luận chuyên nghiệp với giám sát viên.',
      stage: 'heads_up',
      order_index: 2,
      est_minutes: 12,
      objective: 'Use debrief language when discussing near-misses.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Discusses Near-Miss with Supervisor',
          title_vi: 'Nghe: Điều dưỡng Thảo luận Suýt Sai với Giám sát',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse Mai: I wanted to speak with you about something that happened yesterday.\nSupervisor: Of course. Go ahead.\nNurse Mai: There was a near-miss with a medication. I caught it before it reached the patient. I wanted to check my decision with you — I reported it and documented it. One thing I would do differently is double-check the allergy band earlier. This was a learning experience for the whole team. Could you give me feedback on how I handled it?",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Mai (honest, reflective), Supervisor (supportive, professional). Office or quiet area. Duration: 35-40 sec. Slow speed 0.8x.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the Near-Miss Discussion',
          title_vi: 'Đọc Thảo luận Suýt Sai',
          order_index: 2,
          config: {
            script: "Nurse Mai: I wanted to speak with you about a near-miss yesterday. I caught it before it reached the patient. I wanted to check my decision with you. One thing I would do differently is double-check the allergy band earlier. This was a learning experience. Could you give me feedback on how I handled it?\nSupervisor: You did the right thing by reporting it.",
          },
        },
        {
          type: 'cloze',
          title: 'Complete the Near-Miss Discussion',
          title_vi: 'Hoàn thành Thảo luận Suýt Sai',
          order_index: 3,
          config: {
            cloze: "Nurse: I wanted to ___ with you about a near-miss. I ___ it before it reached the patient.\nI wanted to ___ my decision with you. One thing I would do ___ is double-check earlier.\nThis was a ___ experience for the whole team. Could you give me ___ on how I handled it?",
            script: "Nurse: I wanted to speak with you about a near-miss. I caught it before it reached the patient.\nI wanted to check my decision with you. One thing I would do differently is double-check earlier.\nThis was a learning experience for the whole team. Could you give me feedback on how I handled it?",
          },
        },
        {
          type: 'quiz',
          title: 'Near-Miss Communication Check',
          title_vi: 'Kiểm tra Giao tiếp Suýt Sai',
          order_index: 4,
          config: {
            questions: [
              {
                id: 'm9l2q1',
                type: 'mcq',
                prompt_en: '"I wanted to check my decision with you" — what does this communicate?',
                prompt_vi: '"I wanted to check my decision with you" — truyền đạt điều gì?',
                options: [
                  { id: 'a', text: 'The nurse is not sure about anything.', text_vi: 'Điều dưỡng không chắc về gì cả.' },
                  { id: 'b', text: 'Respect for the supervisor and desire for validation or guidance — professional and collaborative.', text_vi: 'Tôn trọng giám sát và mong muốn xác nhận hoặc hướng dẫn — chuyên nghiệp và hợp tác.' },
                  { id: 'c', text: 'The nurse wants the supervisor to take over.', text_vi: 'Điều dưỡng muốn giám sát tiếp quản.' },
                  { id: 'd', text: 'The nurse is blaming the supervisor.', text_vi: 'Điều dưỡng đang đổ lỗi giám sát.' },
                ],
                answer: 'b',
                explanation_en: 'Checking your decision shows you value senior input and want to learn — builds trust.',
                explanation_vi: 'Kiểm tra quyết định cho thấy bạn coi trọng ý kiến cấp trên và muốn học — xây dựng lòng tin.',
              },
              {
                id: 'm9l2q2',
                type: 'mcq',
                prompt_en: 'Why say "This was a learning experience for the whole team" after a near-miss?',
                prompt_vi: 'Tại sao nói "This was a learning experience for the whole team" sau suýt sai?',
                options: [
                  { id: 'a', text: 'To avoid blame.', text_vi: 'Để tránh đổ lỗi.' },
                  { id: 'b', text: 'To frame the event as an opportunity for improvement — reduces shame and encourages reporting.', text_vi: 'Để đặt sự kiện như cơ hội cải thiện — giảm xấu hổ và khuyến khích báo cáo.' },
                  { id: 'c', text: 'To make the team feel better.', text_vi: 'Để làm đội cảm thấy tốt hơn.' },
                  { id: 'd', text: 'Only for serious errors.', text_vi: 'Chỉ cho lỗi nghiêm trọng.' },
                ],
                answer: 'b',
                explanation_en: 'Framing as learning reduces fear of reporting — essential for patient safety culture.',
                explanation_vi: 'Đặt như học hỏi giảm sợ báo cáo — cần thiết cho văn hóa an toàn bệnh nhân.',
              },
              {
                id: 'm9l2q3',
                type: 'mcq',
                prompt_en: 'When reporting a near-miss, what should you do first?',
                prompt_vi: 'Khi báo cáo suýt sai, bạn nên làm gì trước?',
                options: [
                  { id: 'a', text: 'Wait until someone asks.', text_vi: 'Chờ đến khi ai đó hỏi.' },
                  { id: 'b', text: 'Report it promptly, document it, and discuss with supervisor — transparency protects patients.', text_vi: 'Báo cáo kịp thời, ghi chép, và thảo luận với giám sát — minh bạch bảo vệ bệnh nhân.' },
                  { id: 'c', text: 'Tell only your friends.', text_vi: 'Chỉ nói với bạn bè.' },
                  { id: 'd', text: 'Ignore it if no harm was done.', text_vi: 'Bỏ qua nếu không có tổn hại.' },
                ],
                answer: 'b',
                explanation_en: 'Prompt reporting and documentation help prevent future harm. Near-misses are learning opportunities.',
                explanation_vi: 'Báo cáo và ghi chép kịp thời giúp ngăn tổn hại tương lai. Suýt sai là cơ hội học hỏi.',
              },
            ],
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 3 — HEADS DOWN  (audio_shadow → cloze → quiz)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Presenting a Case to the Ward Team',
      title_vi: 'Trình bày Ca bệnh cho Đội Khoa',
      description: 'You need to present a case to the ward team. Learn the language for case presentation and reflection.',
      description_vi: 'Bạn cần trình bày ca bệnh cho đội khoa. Học ngôn ngữ trình bày ca và phản ánh.',
      stage: 'heads_down',
      order_index: 3,
      est_minutes: 15,
      objective: 'Use debrief and reflection language when presenting cases.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Presents Case to Ward Team',
          title_vi: 'Nghe: Điều dưỡng Trình bày Ca cho Đội Khoa',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'normal',
            transcript: "Nurse Hoa: I would like to present a case from last week. Mr. Davies in Bed 4 — he deteriorated quickly. What went well in that situation? I think we escalated fast and the doctor arrived within five minutes. One thing I would do differently is — I could have reassured the family sooner. This was a learning experience for the whole team. Could you give me feedback on my communication during the escalation? I want to improve.",
            _instructions: 'AUDIO PRODUCER: One main speaker — Nurse Hoa (structured, reflective). Ward meeting. Duration: 35-40 sec. Normal speed.',
          },
        },
        {
          type: 'cloze',
          title: 'Fill in the Case Presentation',
          title_vi: 'Điền vào Trình bày Ca',
          order_index: 2,
          config: {
            cloze: "Nurse: I would like to ___ a case from last week. Mr. Davies ___ quickly.\nWhat ___ well in that situation? I think we ___ fast. One thing I would do ___ is — I could have reassured the family sooner.\nThis was a ___ experience for the whole team. Could you give me ___ on my communication?",
            script: "Nurse: I would like to present a case from last week. Mr. Davies deteriorated quickly.\nWhat went well in that situation? I think we escalated fast. One thing I would do differently is — I could have reassured the family sooner.\nThis was a learning experience for the whole team. Could you give me feedback on my communication?",
          },
        },
        {
          type: 'quiz',
          title: 'Case Presentation Check',
          title_vi: 'Kiểm tra Trình bày Ca',
          order_index: 3,
          config: {
            questions: [
              {
                id: 'm9l3q1',
                type: 'mcq',
                prompt_en: 'In a case presentation, why start with "What went well"?',
                prompt_vi: 'Trong trình bày ca, tại sao bắt đầu với "What went well"?',
                options: [
                  { id: 'a', text: 'To make the presentation longer.', text_vi: 'Để làm trình bày dài hơn.' },
                  { id: 'b', text: 'To create psychological safety and balanced reflection — not just focus on problems.', text_vi: 'Để tạo an toàn tâm lý và phản ánh cân bằng — không chỉ tập trung vào vấn đề.' },
                  { id: 'c', text: 'Because the supervisor asked.', text_vi: 'Vì giám sát yêu cầu.' },
                  { id: 'd', text: 'It is not important.', text_vi: 'Nó không quan trọng.' },
                ],
                answer: 'b',
                explanation_en: 'Starting with positives creates safety and encourages honest reflection on improvements.',
                explanation_vi: 'Bắt đầu với điều tích cực tạo an toàn và khuyến khích phản ánh trung thực về cải thiện.',
              },
              {
                id: 'm9l3q2',
                type: 'mcq',
                prompt_en: '"Could you give me feedback on my communication?" — what does this show?',
                prompt_vi: '"Could you give me feedback on my communication?" — thể hiện gì?',
                options: [
                  { id: 'a', text: 'The nurse is not confident.', text_vi: 'Điều dưỡng không tự tin.' },
                  { id: 'b', text: 'Growth mindset — willingness to improve communication skills.', text_vi: 'Tư duy phát triển — sẵn sàng cải thiện kỹ năng giao tiếp.' },
                  { id: 'c', text: 'The nurse made many mistakes.', text_vi: 'Điều dưỡng đã mắc nhiều lỗi.' },
                  { id: 'd', text: 'Only for new nurses.', text_vi: 'Chỉ cho điều dưỡng mới.' },
                ],
                answer: 'b',
                explanation_en: 'Asking for feedback on communication shows professionalism and commitment to improvement.',
                explanation_vi: 'Xin phản hồi về giao tiếp thể hiện chuyên nghiệp và cam kết cải thiện.',
              },
              {
                id: 'm9l3q3',
                type: 'mcq',
                prompt_en: 'When presenting a case for learning, what should you include?',
                prompt_vi: 'Khi trình bày ca để học hỏi, bạn nên bao gồm gì?',
                options: [
                  { id: 'a', text: 'Only what went wrong.', text_vi: 'Chỉ điều sai.' },
                  { id: 'b', text: 'What went well, what could improve, and request for feedback — balanced and constructive.', text_vi: 'Điều tốt, điều có thể cải thiện, và xin phản hồi — cân bằng và xây dựng.' },
                  { id: 'c', text: 'Blame for others.', text_vi: 'Đổ lỗi người khác.' },
                  { id: 'd', text: 'Only the medical facts.', text_vi: 'Chỉ sự thật y tế.' },
                ],
                answer: 'b',
                explanation_en: 'Balanced reflection (good + improve + feedback) creates effective learning discussions.',
                explanation_vi: 'Phản ánh cân bằng (tốt + cải thiện + phản hồi) tạo thảo luận học hỏi hiệu quả.',
              },
            ],
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 4 — HEADS DOWN  (scenario_intro → audio_shadow → script_read → cloze)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Asking a Senior Colleague for Feedback',
      title_vi: 'Xin Phản hồi từ Đồng nghiệp Cấp cao',
      description: 'You want to improve. Learn how to ask a senior colleague for feedback on your performance.',
      description_vi: 'Bạn muốn cải thiện. Học cách xin phản hồi từ đồng nghiệp cấp cao về hiệu suất của bạn.',
      stage: 'heads_down',
      order_index: 4,
      est_minutes: 15,
      objective: 'Ask for feedback professionally from senior colleagues.',
      steps: [
        {
          type: 'scenario_intro',
          title: 'Ward — After a Difficult Shift',
          title_vi: 'Khoa — Sau Ca Khó',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            setting_en: 'Ward Office — End of Shift',
            setting_vi: 'Văn phòng Khoa — Cuối Ca',
            context_en: 'You have just finished a difficult shift. There was a resuscitation and you were part of the team. You want to learn from the experience. You approach a senior nurse to ask for feedback on your communication and actions.',
            context_vi: 'Bạn vừa kết thúc ca khó. Có hồi sức và bạn là thành viên đội. Bạn muốn học từ trải nghiệm. Bạn tiếp cận điều dưỡng cấp cao để xin phản hồi về giao tiếp và hành động của bạn.',
            key_phrases: [
              { en: 'What went well in that situation?', vi: 'Điều gì đã diễn ra tốt trong tình huống đó?' },
              { en: 'One thing I would do differently is...', vi: 'Một điều tôi sẽ làm khác đi là...' },
              { en: 'I wanted to check my decision with you.', vi: 'Tôi muốn kiểm tra quyết định của tôi với bạn.' },
              { en: 'This was a learning experience for the whole team.', vi: 'Đây là trải nghiệm học hỏi cho cả đội.' },
              { en: 'Could you give me feedback on my communication?', vi: 'Bạn có thể cho tôi phản hồi về giao tiếp của tôi không?' },
            ],
            _instructions: 'AUDIO PRODUCER: 15-20 sec ward office ambient — end of shift, quiet. No dialogue. Mood: reflective.',
          },
        },
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Asks Senior for Feedback',
          title_vi: 'Nghe: Điều dưỡng Xin Phản hồi từ Cấp cao',
          order_index: 2,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse Linh: Could I speak with you for a moment? I wanted to check my decision with you about the resuscitation.\nSenior Nurse: Of course. What would you like to discuss?\nNurse Linh: What went well in that situation? I think the team worked well together. One thing I would do differently is — I could have spoken louder when I called for the crash trolley. This was a learning experience for the whole team. Could you give me feedback on my communication? I want to improve for next time.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Linh (humble, eager to learn), Senior Nurse (supportive, experienced). Ward office. Duration: 38-42 sec. Slow speed 0.8x.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the Feedback Request',
          title_vi: 'Đọc Yêu cầu Phản hồi',
          order_index: 3,
          config: {
            script: "Nurse Linh: I wanted to check my decision with you about the resuscitation.\nSenior Nurse: Of course. What would you like to discuss?\nNurse Linh: What went well in that situation? One thing I would do differently is — I could have spoken louder. This was a learning experience. Could you give me feedback on my communication?",
          },
        },
        {
          type: 'cloze',
          title: 'Complete the Feedback Request',
          title_vi: 'Hoàn thành Yêu cầu Phản hồi',
          order_index: 4,
          config: {
            cloze: "Nurse: I wanted to ___ my decision with you about the resuscitation.\nWhat ___ well in that situation? One thing I would do ___ is — I could have spoken louder.\nThis was a ___ experience for the whole team. Could you give me ___ on my communication?",
            script: "Nurse: I wanted to check my decision with you about the resuscitation.\nWhat went well in that situation? One thing I would do differently is — I could have spoken louder.\nThis was a learning experience for the whole team. Could you give me feedback on my communication?",
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 5 — HEADS DOWN  (audio_shadow → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Reflecting on a Difficult Handover',
      title_vi: 'Phản ánh về Bàn giao Khó',
      description: 'A handover did not go smoothly. Practice reflecting on it and asking for feedback. Record yourself.',
      description_vi: 'Một bàn giao không suôn sẻ. Thực hành phản ánh và xin phản hồi. Ghi âm.',
      stage: 'heads_down',
      order_index: 5,
      est_minutes: 18,
      objective: 'Reflect on a difficult situation and ask for feedback.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Reflects on Difficult Handover',
          title_vi: 'Nghe: Điều dưỡng Phản ánh Bàn giao Khó',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse Anh: I wanted to talk about the handover this morning. What went well in that situation? I think I gave the key information. But one thing I would do differently is — I could have been clearer about the outstanding concerns. I wanted to check my decision with you. Was it right to prioritise Mr. Chen? This was a learning experience for the whole team. Could you give me feedback on my communication?",
            _instructions: 'AUDIO PRODUCER: One main speaker — Nurse Anh (reflective, honest). Brief colleague response. Handover room. Duration: 35-40 sec. Slow speed 0.8x.',
          },
        },
        {
          type: 'cloze',
          title: 'Build the Reflection',
          title_vi: 'Xây dựng Phản ánh',
          order_index: 2,
          config: {
            cloze: "Nurse: What ___ well in that situation? I think I gave the key ___.\nOne thing I would do ___ is — I could have been clearer about the ___ concerns.\nI wanted to ___ my decision with you. This was a ___ experience for the whole team.\nCould you give me ___ on my communication?",
            script: "Nurse: What went well in that situation? I think I gave the key information.\nOne thing I would do differently is — I could have been clearer about the outstanding concerns.\nI wanted to check my decision with you. This was a learning experience for the whole team.\nCould you give me feedback on my communication?",
          },
        },
        {
          type: 'no_script',
          title: 'Speak It — No Script',
          title_vi: 'Nói — Không Kịch bản',
          order_index: 3,
          config: {
            context: 'You are reflecting on a difficult situation (handover, resuscitation, or near-miss). Use the debrief phrases to discuss it with a colleague.',
            cues: [
              '"What went well in that situation?"',
              '"One thing I would do differently is..."',
              '"I wanted to check my decision with you"',
              '"This was a learning experience for the whole team"',
              '"Could you give me feedback on my communication?"',
            ],
            timer_seconds: 90,
            timer_visible: true,
          },
        },
        {
          type: 'recording_submit',
          title: 'Record Your Reflection',
          title_vi: 'Ghi âm Phản ánh của Bạn',
          order_index: 4,
          config: {
            prompt_en: 'Record yourself reflecting on a clinical situation and asking for feedback. Use at least four key phrases from this module.',
            prompt_vi: 'Ghi âm bạn phản ánh về tình huống lâm sàng và xin phản hồi. Sử dụng ít nhất bốn cụm từ chính từ module này.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'Record yourself as the nurse. Include: "What went well", "One thing I would do differently", "I wanted to check my decision with you", "This was a learning experience", "Could you give me feedback on my communication". Aim for 35-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 6 — HEADS TOGETHER  (script_read → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Pair Practice — Nurse to Supervisor Debrief',
      title_vi: 'Luyện tập Cặp — Rút kinh nghiệm Điều dưỡng với Giám sát',
      description: 'Work with a partner. One plays the nurse, one plays the supervisor. Practice debrief language.',
      description_vi: 'Làm việc với đối tác. Một người đóng vai điều dưỡng, một người đóng vai giám sát. Thực hành ngôn ngữ rút kinh nghiệm.',
      stage: 'heads_together',
      order_index: 6,
      est_minutes: 20,
      objective: 'Practice nurse-to-supervisor debrief with a partner.',
      steps: [
        {
          type: 'script_read',
          title: 'Full Script — Nurse Debriefs with Supervisor',
          title_vi: 'Kịch bản Đầy đủ — Điều dưỡng Rút kinh nghiệm với Giám sát',
          order_index: 1,
          config: {
            script: "Nurse: I wanted to speak with you about the incident yesterday. What went well in that situation? I think we responded quickly. One thing I would do differently is — I could have called for help sooner. I wanted to check my decision with you. This was a learning experience for the whole team. Could you give me feedback on my communication?\nSupervisor: You did well. One suggestion — when you escalate, state the location first. That helps the team respond faster.",
          },
        },
        {
          type: 'cloze',
          title: 'Round 2 — Partial Script',
          title_vi: 'Vòng 2 — Kịch bản Một phần',
          order_index: 2,
          config: {
            cloze: "Nurse: What ___ well in that situation? I think we ___ quickly.\nOne thing I would do ___ is — I could have called for ___ sooner.\nI wanted to ___ my decision with you. This was a ___ experience for the whole team.\nCould you give me ___ on my communication?",
            script: "Nurse: What went well in that situation? I think we responded quickly.\nOne thing I would do differently is — I could have called for help sooner.\nI wanted to check my decision with you. This was a learning experience for the whole team.\nCould you give me feedback on my communication?",
          },
        },
        {
          type: 'no_script',
          title: 'Round 3 — Cue Cards Only',
          title_vi: 'Vòng 3 — Chỉ Thẻ Gợi ý',
          order_index: 3,
          config: {
            context: 'Nurse A: Debrief with supervisor about a clinical situation. Nurse B: Play the supervisor. Switch roles after one round.',
            cues: [
              '"What went well in that situation?"',
              '"One thing I would do differently is..."',
              '"I wanted to check my decision with you"',
              '"This was a learning experience for the whole team"',
              '"Could you give me feedback on my communication?"',
            ],
            timer_seconds: 90,
            timer_visible: true,
          },
        },
        {
          type: 'recording_submit',
          title: 'Submit Your Best Round',
          title_vi: 'Nộp Vòng Tốt nhất của Bạn',
          order_index: 4,
          config: {
            prompt_en: 'Record your best performance as the nurse in a debrief with a supervisor.',
            prompt_vi: 'Ghi âm phần trình diễn tốt nhất của bạn với vai điều dưỡng trong rút kinh nghiệm với giám sát.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'PAIR PRACTICE: Complete all three rounds. Submit ONE recording — your best as the nurse. Include at least three key debrief phrases. Aim for 30-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 7 — HEADS TOGETHER  (script_read → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Pair Practice — Nurse to Nurse Case Presentation',
      title_vi: 'Luyện tập Cặp — Trình bày Ca Điều dưỡng đến Điều dưỡng',
      description: 'Present a case to a colleague. One plays the presenter, one plays the listener. Practice reflection language.',
      description_vi: 'Trình bày ca cho đồng nghiệp. Một người đóng vai trình bày, một người đóng vai nghe. Thực hành ngôn ngữ phản ánh.',
      stage: 'heads_together',
      order_index: 7,
      est_minutes: 20,
      objective: 'Practice nurse-to-nurse case presentation with a partner.',
      steps: [
        {
          type: 'script_read',
          title: 'Full Script — Nurse Presents Case to Colleague',
          title_vi: 'Kịch bản Đầy đủ — Điều dưỡng Trình bày Ca cho Đồng nghiệp',
          order_index: 1,
          config: {
            script: "Nurse: I would like to share a case. Mr. Park deteriorated last night. What went well in that situation? We escalated quickly. One thing I would do differently is — I could have documented the vital signs earlier. I wanted to check my decision with you — was it right to call the doctor at that point? This was a learning experience for the whole team. Could you give me feedback on my communication during the handover?",
          },
        },
        {
          type: 'cloze',
          title: 'Round 2 — Partial Script',
          title_vi: 'Vòng 2 — Kịch bản Một phần',
          order_index: 2,
          config: {
            cloze: "Nurse: What ___ well in that situation? We ___ quickly.\nOne thing I would do ___ is — I could have ___ the vital signs earlier.\nI wanted to ___ my decision with you. This was a ___ experience for the whole team.\nCould you give me ___ on my communication?",
            script: "Nurse: What went well in that situation? We escalated quickly.\nOne thing I would do differently is — I could have documented the vital signs earlier.\nI wanted to check my decision with you. This was a learning experience for the whole team.\nCould you give me feedback on my communication?",
          },
        },
        {
          type: 'no_script',
          title: 'Round 3 — Cue Cards Only',
          title_vi: 'Vòng 3 — Chỉ Thẻ Gợi ý',
          order_index: 3,
          config: {
            context: 'Nurse A: Present a case and reflect. Nurse B: Listen and give feedback. Switch roles.',
            cues: [
              '"What went well in that situation?"',
              '"One thing I would do differently is..."',
              '"I wanted to check my decision with you"',
              '"This was a learning experience for the whole team"',
              '"Could you give me feedback on my communication?"',
            ],
            timer_seconds: 90,
            timer_visible: true,
          },
        },
        {
          type: 'recording_submit',
          title: 'Record Your Case Presentation',
          title_vi: 'Ghi âm Trình bày Ca của Bạn',
          order_index: 4,
          config: {
            prompt_en: 'Record yourself presenting a case and asking for feedback.',
            prompt_vi: 'Ghi âm bạn trình bày ca và xin phản hồi.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'Record yourself as the nurse. Include: "What went well", "One thing I would do differently", "I wanted to check my decision with you", "This was a learning experience", "Could you give me feedback on my communication". Aim for 30-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 8 — ASSESSMENT  (quiz → cloze → recording_submit → self_reflection)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Module Assessment — Debrief & Self-Reflection',
      title_vi: 'Kiểm tra Module — Rút kinh nghiệm & Tự Phản ánh',
      description: 'A comprehensive assessment of debrief and feedback language. Finish by reflecting on what you have learned.',
      description_vi: 'Đánh giá toàn diện về ngôn ngữ rút kinh nghiệm và phản hồi. Kết thúc bằng phản ánh những gì bạn đã học.',
      stage: 'assessment',
      order_index: 8,
      est_minutes: 25,
      objective: 'Demonstrate Module 9 debrief and feedback language.',
      steps: [
        {
          type: 'quiz',
          title: 'Module 9 Knowledge Check',
          title_vi: 'Kiểm tra Kiến thức Module 9',
          order_index: 1,
          config: {
            questions: [
              {
                id: 'm9l8q1',
                type: 'mcq',
                prompt_en: '[Part A — Vocabulary] "What went well in that situation?" is used to:',
                prompt_vi: '[Phần A — Từ vựng] "What went well in that situation?" được dùng để:',
                options: [
                  { id: 'a', text: 'Criticise the team.', text_vi: 'Chỉ trích đội.' },
                  { id: 'b', text: 'Open reflection on positives first — creates psychological safety for debrief.', text_vi: 'Mở phản ánh về điều tích cực trước — tạo an toàn tâm lý cho rút kinh nghiệm.' },
                  { id: 'c', text: 'End the discussion.', text_vi: 'Kết thúc thảo luận.' },
                  { id: 'd', text: 'Only for doctors.', text_vi: 'Chỉ cho bác sĩ.' },
                ],
                answer: 'b',
                explanation_en: 'Starting with "what went well" creates safety before discussing improvements.',
                explanation_vi: 'Bắt đầu với "what went well" tạo an toàn trước khi thảo luận cải thiện.',
              },
              {
                id: 'm9l8q2',
                type: 'mcq',
                prompt_en: '[Part B — Protocol] "I wanted to check my decision with you" shows:',
                prompt_vi: '[Phần B — Quy trình] "I wanted to check my decision with you" thể hiện:',
                options: [
                  { id: 'a', text: 'The nurse does not trust themselves.', text_vi: 'Điều dưỡng không tin bản thân.' },
                  { id: 'b', text: 'Respect for senior input and desire for validation — professional and collaborative.', text_vi: 'Tôn trọng ý kiến cấp trên và mong muốn xác nhận — chuyên nghiệp và hợp tác.' },
                  { id: 'c', text: 'The nurse made a mistake.', text_vi: 'Điều dưỡng đã mắc lỗi.' },
                  { id: 'd', text: 'Only for new staff.', text_vi: 'Chỉ cho nhân viên mới.' },
                ],
                answer: 'b',
                explanation_en: 'Checking your decision shows you value feedback and want to learn.',
                explanation_vi: 'Kiểm tra quyết định cho thấy bạn coi trọng phản hồi và muốn học hỏi.',
              },
              {
                id: 'm9l8q3',
                type: 'mcq',
                prompt_en: '[Part C — Communication] "This was a learning experience for the whole team" — why say this?',
                prompt_vi: '[Phần C — Giao tiếp] "This was a learning experience for the whole team" — tại sao nói?',
                options: [
                  { id: 'a', text: 'To avoid blame.', text_vi: 'Để tránh đổ lỗi.' },
                  { id: 'b', text: 'To frame the event as improvement opportunity — reduces shame, encourages reporting.', text_vi: 'Để đặt sự kiện như cơ hội cải thiện — giảm xấu hổ, khuyến khích báo cáo.' },
                  { id: 'c', text: 'To make everyone feel better.', text_vi: 'Để mọi người cảm thấy tốt hơn.' },
                  { id: 'd', text: 'Only after serious errors.', text_vi: 'Chỉ sau lỗi nghiêm trọng.' },
                ],
                answer: 'b',
                explanation_en: 'Framing as learning supports safety culture and encourages near-miss reporting.',
                explanation_vi: 'Đặt như học hỏi hỗ trợ văn hóa an toàn và khuyến khích báo cáo suýt sai.',
              },
              {
                id: 'm9l8q4',
                type: 'mcq',
                prompt_en: '[Part D — Decision] After a near-miss, you should:',
                prompt_vi: '[Phần D — Quyết định] Sau suýt sai, bạn nên:',
                options: [
                  { id: 'a', text: 'Keep it to yourself if no harm was done.', text_vi: 'Giữ cho mình nếu không có tổn hại.' },
                  { id: 'b', text: 'Report it, document it, and discuss with supervisor — transparency protects patients.', text_vi: 'Báo cáo, ghi chép, và thảo luận với giám sát — minh bạch bảo vệ bệnh nhân.' },
                  { id: 'c', text: 'Only tell your friends.', text_vi: 'Chỉ nói với bạn bè.' },
                  { id: 'd', text: 'Wait for someone to ask.', text_vi: 'Chờ ai đó hỏi.' },
                ],
                answer: 'b',
                explanation_en: 'Reporting near-misses helps prevent future harm. Transparency is essential for patient safety.',
                explanation_vi: 'Báo cáo suýt sai giúp ngăn tổn hại tương lai. Minh bạch cần thiết cho an toàn bệnh nhân.',
              },
            ],
          },
        },
        {
          type: 'cloze',
          title: 'Complete the Full Debrief',
          title_vi: 'Hoàn thành Rút kinh nghiệm Đầy đủ',
          order_index: 2,
          config: {
            cloze: "Nurse: What ___ well in that situation? I think we ___ quickly.\nOne thing I would do ___ is — I could have ___.\nI wanted to ___ my decision with you. This was a ___ experience for the whole team.\nCould you give me ___ on my communication?",
            script: "Nurse: What went well in that situation? I think we responded quickly.\nOne thing I would do differently is — I could have called for help sooner.\nI wanted to check my decision with you. This was a learning experience for the whole team.\nCould you give me feedback on my communication?",
          },
        },
        {
          type: 'recording_submit',
          title: 'Final Assessment Recording',
          title_vi: 'Ghi âm Đánh giá Cuối cùng',
          order_index: 3,
          config: {
            prompt_en: 'Record yourself conducting a debrief or asking for feedback. Use all five key phrases from this module.',
            prompt_vi: 'Ghi âm bạn thực hiện rút kinh nghiệm hoặc xin phản hồi. Sử dụng cả năm cụm từ chính từ module này.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: '[FINAL ASSESSMENT] You are Nurse [Your Name]. Conduct a debrief or ask for feedback on a clinical situation. Include: "What went well in that situation?", "One thing I would do differently is...", "I wanted to check my decision with you", "This was a learning experience for the whole team", "Could you give me feedback on my communication?" Aim for 40-50 seconds.',
          },
        },
        {
          type: 'self_reflection',
          title: 'Module 9 Self-Reflection',
          title_vi: 'Tự Phản ánh Module 9',
          order_index: 4,
          config: {
            prompts: [
              {
                key: 'confidence',
                type: 'slider',
                label_en: 'How confident do you feel using debrief language in English now?',
                label_vi: 'Bạn cảm thấy tự tin sử dụng ngôn ngữ rút kinh nghiệm bằng tiếng Anh chưa?',
              },
              {
                key: 'usefulness',
                type: 'slider',
                label_en: 'How useful was this module for your real clinical work?',
                label_vi: 'Module này có hữu ích cho công việc lâm sàng thực tế của bạn không?',
              },
              {
                key: 'difficulty',
                type: 'slider',
                label_en: 'How difficult was the debrief language in this module?',
                label_vi: 'Ngôn ngữ rút kinh nghiệm trong module này khó ở mức độ nào?',
              },
              {
                key: 'pair_helped',
                type: 'slider',
                label_en: 'Did the pair practice (Lessons 6 and 7) help you feel more prepared?',
                label_vi: 'Luyện tập cặp đôi (Bài 6 và 7) có giúp bạn cảm thấy sẵn sàng hơn không?',
              },
              {
                key: 'open_feedback',
                type: 'text',
                label_en: 'Which debrief phrase will you try to use on your next shift?',
                label_vi: 'Bạn sẽ thử dùng cụm từ rút kinh nghiệm nào trong ca làm tiếp theo?',
              },
            ],
          },
        },
      ],
    },
  ]

  for (const lessonData of lessons) {
    const { steps, description_vi: _dv, ...lessonFields } = lessonData

    const { data: lesson, error: lessonError } = await db
      .from('nursed_lessons')
      .insert({ ...lessonFields, module_id: moduleId, published: true })
      .select()
      .single()

    if (lessonError || !lesson) throw new Error(lessonError?.message ?? `Failed to create lesson: ${lessonFields.title}`)

    for (const stepData of steps) {
      const { error: stepError } = await db.from('nursed_lesson_steps').insert({
        lesson_id: lesson.id,
        type: stepData.type,
        title: stepData.title,
        title_vi: (stepData as any).title_vi ?? null,
        order_index: stepData.order_index,
        config: stepData.config,
      })

      if (stepError) throw new Error(stepError.message ?? `Failed to create step in ${lessonFields.title}`)
    }
  }
}
