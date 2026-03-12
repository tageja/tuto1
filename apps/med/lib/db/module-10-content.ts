/**
 * NurseMed Emergency Nursing Communication - Module 10
 * "Emergency Procedures Communication"
 *
 * Module 10 teaches explaining emergency procedures to conscious patients
 * in real-time — IV insertion, catheter, oxygen therapy, NG tube,
 * defibrillation preparation.
 *
 * 8 Lessons: Heads Up → Heads Down → Heads Together → Assessment
 * Module shell ALREADY EXISTS — do NOT insert into nursed_modules.
 */

import { getServiceClient } from '../supabase'

export async function seedModule10(moduleId: string) {
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
      title: 'Explaining IV Line Insertion',
      title_vi: 'Giải thích Đặt Đường truyền Tĩnh mạch',
      description: 'A patient needs an IV. Learn the language nurses use to explain the procedure and gain consent quickly.',
      description_vi: 'Bệnh nhân cần truyền tĩnh mạch. Học ngôn ngữ điều dưỡng dùng để giải thích thủ thuật và xin đồng ý nhanh.',
      stage: 'heads_up',
      order_index: 1,
      est_minutes: 12,
      objective: 'Identify key phrases for explaining IV insertion.',
      steps: [
        {
          type: 'scenario_intro',
          title: 'A&E — Patient Needs IV',
          title_vi: 'Cấp cứu — Bệnh nhân Cần Truyền tĩnh mạch',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            setting_en: 'A&E Resuscitation Bay',
            setting_vi: 'Khu Hồi sức Cấp cứu',
            context_en: 'Mr. Davies, 55, has arrived with chest pain. The doctor has ordered IV access for fluids and medication. He is conscious but anxious. You need to explain what you are about to do and gain his permission quickly.',
            context_vi: 'Ông Davies, 55 tuổi, đến với đau ngực. Bác sĩ đã chỉ định đặt đường truyền tĩnh mạch để truyền dịch và thuốc. Ông tỉnh nhưng lo lắng. Bạn cần giải thích việc bạn sắp làm và xin phép nhanh.',
            key_phrases: [
              { en: 'I need to put a needle in your arm.', vi: 'Tôi cần đặt kim vào tay bạn.' },
              { en: 'This will help you breathe better.', vi: 'Điều này sẽ giúp bạn thở tốt hơn.' },
              { en: 'You may feel a sharp sting.', vi: 'Bạn có thể cảm thấy đau nhói.' },
              { en: 'I need your permission to do this quickly.', vi: 'Tôi cần sự đồng ý của bạn để làm điều này nhanh.' },
              { en: 'I will explain everything as I go.', vi: 'Tôi sẽ giải thích mọi thứ khi tôi làm.' },
            ],
            _instructions: 'AUDIO PRODUCER: 15-20 sec A&E ambient — resuscitation bay, monitor beeps. No dialogue. Mood: urgent but controlled.',
          },
        },
        {
          type: 'audio_shadow',
          title: 'Listen & Repeat: IV Insertion Explanation',
          title_vi: 'Nghe & Lặp lại: Giải thích Đặt Truyền tĩnh mạch',
          order_index: 2,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse Lan: Mr. Davies, I need to put a needle in your arm. This will help us give you fluids and medication. You may feel a sharp sting for a moment. I need your permission to do this quickly. I will explain everything as I go. Can you hold your arm still for me?\nPatient: Yes, okay. Will it hurt?\nNurse Lan: You may feel a sharp sting when the needle goes in. It will only last a second. I will be as quick as I can. Ready?",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Lan (female, calm, clear), Patient Davies (male, anxious). A&E bay. Duration: 35-40 sec. Speed: 0.8x slow.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the IV Explanation Dialogue',
          title_vi: 'Đọc Hội thoại Giải thích Truyền tĩnh mạch',
          order_index: 3,
          config: {
            script: "Nurse: I need to put a needle in your arm. This will help us give you fluids and medication. You may feel a sharp sting. I need your permission to do this quickly. I will explain everything as I go.\nPatient: Will it hurt?\nNurse: You may feel a sharp sting when the needle goes in. It will only last a second. Ready?",
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
                id: 'm10l1q1',
                type: 'mcq',
                prompt_en: 'Why say "I need to put a needle in your arm" before the procedure?',
                prompt_vi: 'Tại sao nói "I need to put a needle in your arm" trước thủ thuật?',
                options: [
                  { id: 'a', text: 'To scare the patient.', text_vi: 'Để làm bệnh nhân sợ.' },
                  { id: 'b', text: 'To give clear, honest information — builds trust and prepares the patient.', text_vi: 'Để đưa thông tin rõ ràng, chân thật — xây dựng lòng tin và chuẩn bị bệnh nhân.' },
                  { id: 'c', text: 'Only for children.', text_vi: 'Chỉ cho trẻ em.' },
                  { id: 'd', text: 'To avoid consent.', text_vi: 'Để tránh xin đồng ý.' },
                ],
                answer: 'b',
                explanation_en: 'Clear explanation before procedures reduces anxiety and helps the patient cooperate.',
                explanation_vi: 'Giải thích rõ trước thủ thuật giảm lo lắng và giúp bệnh nhân hợp tác.',
              },
              {
                id: 'm10l1q2',
                type: 'mcq',
                prompt_en: '"You may feel a sharp sting" — what does this achieve?',
                prompt_vi: '"You may feel a sharp sting" — đạt được gì?',
                options: [
                  { id: 'a', text: 'It makes the patient refuse.', text_vi: 'Nó làm bệnh nhân từ chối.' },
                  { id: 'b', text: 'It sets realistic expectations — patient is prepared and less likely to jerk away.', text_vi: 'Nó đặt kỳ vọng thực tế — bệnh nhân được chuẩn bị và ít giật mình.' },
                  { id: 'c', text: 'It is only for IV.', text_vi: 'Chỉ cho truyền tĩnh mạch.' },
                  { id: 'd', text: 'It is not important.', text_vi: 'Nó không quan trọng.' },
                ],
                answer: 'b',
                explanation_en: 'Warning about sensation prepares the patient — reduces surprise and movement during insertion.',
                explanation_vi: 'Cảnh báo về cảm giác chuẩn bị bệnh nhân — giảm bất ngờ và cử động khi đặt kim.',
              },
              {
                id: 'm10l1q3',
                type: 'mcq',
                prompt_en: '"I need your permission to do this quickly" — when is this used?',
                prompt_vi: '"I need your permission to do this quickly" — khi nào dùng?',
                options: [
                  { id: 'a', text: 'Only for elective procedures.', text_vi: 'Chỉ cho thủ thuật chọn lọc.' },
                  { id: 'b', text: 'When the procedure is urgent but the patient is conscious — rapid consent while respecting autonomy.', text_vi: 'Khi thủ thuật khẩn nhưng bệnh nhân tỉnh — xin đồng ý nhanh trong khi tôn trọng quyền tự chủ.' },
                  { id: 'c', text: 'To avoid doing the procedure.', text_vi: 'Để tránh làm thủ thuật.' },
                  { id: 'd', text: 'Only for family members.', text_vi: 'Chỉ cho người nhà.' },
                ],
                answer: 'b',
                explanation_en: 'Rapid consent phrase for urgent procedures — balances urgency with patient rights.',
                explanation_vi: 'Cụm từ xin đồng ý nhanh cho thủ thuật khẩn — cân bằng khẩn cấp với quyền bệnh nhân.',
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
      title: 'Explaining Oxygen Mask vs Nasal Cannula',
      title_vi: 'Giải thích Mặt nạ Oxy vs Ống thở Mũi',
      description: 'A patient needs oxygen. Learn to explain the difference between mask and cannula clearly.',
      description_vi: 'Bệnh nhân cần oxy. Học cách giải thích sự khác biệt giữa mặt nạ và ống thở mũi rõ ràng.',
      stage: 'heads_up',
      order_index: 2,
      est_minutes: 12,
      objective: 'Use procedure explanation phrases for oxygen therapy.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Explains Oxygen Therapy',
          title_vi: 'Nghe: Điều dưỡng Giải thích Liệu pháp Oxy',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse Mai: Mrs. Park, I am going to put this mask over your nose and mouth. This will help you breathe better. You may feel a bit of pressure on your face. I need your permission to do this quickly. I will explain everything as I go. Try to breathe slowly and normally. The oxygen will help.\nPatient: Will I have to keep it on?\nNurse Mai: Yes, for now. This will help you breathe better. The doctor will check you soon.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Mai (calm, reassuring), Patient Park (breathless). Ward/resus. Duration: 35-40 sec. Slow speed 0.8x.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the Oxygen Explanation',
          title_vi: 'Đọc Giải thích Oxy',
          order_index: 2,
          config: {
            script: "Nurse: I am going to put this mask over your nose and mouth. This will help you breathe better. You may feel a bit of pressure. I need your permission to do this quickly. I will explain everything as I go. Try to breathe slowly.\nPatient: Will I have to keep it on?\nNurse: Yes, for now. This will help you breathe better.",
          },
        },
        {
          type: 'cloze',
          title: 'Complete the Oxygen Explanation',
          title_vi: 'Hoàn thành Giải thích Oxy',
          order_index: 3,
          config: {
            cloze: "Nurse: I am going to put this ___ over your nose and mouth. This will help you ___ better.\nYou may feel a bit of ___. I need your ___ to do this quickly.\nI will ___ everything as I go. Try to breathe ___ and normally.",
            script: "Nurse: I am going to put this mask over your nose and mouth. This will help you breathe better.\nYou may feel a bit of pressure. I need your permission to do this quickly.\nI will explain everything as I go. Try to breathe slowly and normally.",
          },
        },
        {
          type: 'quiz',
          title: 'Oxygen Procedure Check',
          title_vi: 'Kiểm tra Thủ thuật Oxy',
          order_index: 4,
          config: {
            questions: [
              {
                id: 'm10l2q1',
                type: 'mcq',
                prompt_en: '"This will help you breathe better" — why say this?',
                prompt_vi: '"This will help you breathe better" — tại sao nói?',
                options: [
                  { id: 'a', text: 'To make the patient feel worse.', text_vi: 'Để làm bệnh nhân cảm thấy tệ hơn.' },
                  { id: 'b', text: 'To explain the benefit — helps the patient accept the procedure and cooperate.', text_vi: 'Để giải thích lợi ích — giúp bệnh nhân chấp nhận thủ thuật và hợp tác.' },
                  { id: 'c', text: 'Only for masks.', text_vi: 'Chỉ cho mặt nạ.' },
                  { id: 'd', text: 'It is optional.', text_vi: 'Nó là tùy chọn.' },
                ],
                answer: 'b',
                explanation_en: 'Explaining benefit increases cooperation — patient understands why the procedure helps.',
                explanation_vi: 'Giải thích lợi ích tăng hợp tác — bệnh nhân hiểu tại sao thủ thuật giúp ích.',
              },
              {
                id: 'm10l2q2',
                type: 'mcq',
                prompt_en: '"I will explain everything as I go" — what does this communicate?',
                prompt_vi: '"I will explain everything as I go" — truyền đạt điều gì?',
                options: [
                  { id: 'a', text: 'The nurse will talk a lot.', text_vi: 'Điều dưỡng sẽ nói nhiều.' },
                  { id: 'b', text: 'The patient will be informed step by step — reduces anxiety and builds trust.', text_vi: 'Bệnh nhân sẽ được thông báo từng bước — giảm lo lắng và xây dựng lòng tin.' },
                  { id: 'c', text: 'The procedure will be slow.', text_vi: 'Thủ thuật sẽ chậm.' },
                  { id: 'd', text: 'Only for complex procedures.', text_vi: 'Chỉ cho thủ thuật phức tạp.' },
                ],
                answer: 'b',
                explanation_en: 'This phrase reassures the patient they will not be surprised — continuous communication.',
                explanation_vi: 'Cụm từ này trấn an bệnh nhân họ sẽ không bị bất ngờ — giao tiếp liên tục.',
              },
              {
                id: 'm10l2q3',
                type: 'mcq',
                prompt_en: 'When explaining oxygen therapy to an anxious patient, what should you do first?',
                prompt_vi: 'Khi giải thích liệu pháp oxy cho bệnh nhân lo lắng, bạn nên làm gì trước?',
                options: [
                  { id: 'a', text: 'Put the mask on immediately.', text_vi: 'Đặt mặt nạ ngay lập tức.' },
                  { id: 'b', text: 'Briefly explain what you will do and why — then gain consent.', text_vi: 'Giải thích ngắn gọn bạn sẽ làm gì và tại sao — sau đó xin đồng ý.' },
                  { id: 'c', text: 'Ask the family first.', text_vi: 'Hỏi gia đình trước.' },
                  { id: 'd', text: 'Wait for the doctor.', text_vi: 'Chờ bác sĩ.' },
                ],
                answer: 'b',
                explanation_en: 'Brief explanation + consent before procedure — respects patient and improves cooperation.',
                explanation_vi: 'Giải thích ngắn + đồng ý trước thủ thuật — tôn trọng bệnh nhân và cải thiện hợp tác.',
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
      title: 'Explaining Defibrillator Pads to a Conscious Patient',
      title_vi: 'Giải thích Miếng Sốc điện cho Bệnh nhân Tỉnh',
      description: 'A conscious patient may need defibrillator pads. Learn to explain this frightening procedure calmly.',
      description_vi: 'Bệnh nhân tỉnh có thể cần miếng sốc điện. Học cách giải thích thủ thuật đáng sợ này bình tĩnh.',
      stage: 'heads_down',
      order_index: 3,
      est_minutes: 15,
      objective: 'Explain defibrillator preparation to a conscious patient.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Explains Defibrillator Pads',
          title_vi: 'Nghe: Điều dưỡng Giải thích Miếng Sốc điện',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'normal',
            transcript: "Nurse Hoa: Mr. Costa, I need to put these pads on your chest. They are for the defibrillator — in case your heart needs a shock. You may feel a sharp sting when I apply the gel. I need your permission to do this quickly. I will explain everything as I go. Please stay still. This will help us be ready if we need to act.\nPatient: Is my heart stopping?\nNurse Hoa: We are monitoring you closely. These pads help us be prepared. Try to stay calm. I will explain everything as I go.",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Hoa (calm, urgent but controlled), Patient Costa (frightened). Resus room. Duration: 38-42 sec. Normal speed.',
          },
        },
        {
          type: 'cloze',
          title: 'Fill in the Defibrillator Explanation',
          title_vi: 'Điền vào Giải thích Sốc điện',
          order_index: 2,
          config: {
            cloze: "Nurse: I need to put these ___ on your chest. They are for the ___ — in case your heart needs a shock.\nYou may feel a sharp ___ when I apply the gel. I need your ___ to do this quickly.\nI will ___ everything as I go. Please stay ___. This will help us be ___ if we need to act.",
            script: "Nurse: I need to put these pads on your chest. They are for the defibrillator — in case your heart needs a shock.\nYou may feel a sharp sting when I apply the gel. I need your permission to do this quickly.\nI will explain everything as I go. Please stay still. This will help us be ready if we need to act.",
          },
        },
        {
          type: 'quiz',
          title: 'Defibrillator Explanation Check',
          title_vi: 'Kiểm tra Giải thích Sốc điện',
          order_index: 3,
          config: {
            questions: [
              {
                id: 'm10l3q1',
                type: 'mcq',
                prompt_en: 'Why explain defibrillator pads to a conscious patient?',
                prompt_vi: 'Tại sao giải thích miếng sốc điện cho bệnh nhân tỉnh?',
                options: [
                  { id: 'a', text: 'To scare them.', text_vi: 'Để làm họ sợ.' },
                  { id: 'b', text: 'To prepare them for the sensation and gain cooperation — reduces panic and movement.', text_vi: 'Để chuẩn bị họ cho cảm giác và giành hợp tác — giảm hoảng loạn và cử động.' },
                  { id: 'c', text: 'Only for family.', text_vi: 'Chỉ cho gia đình.' },
                  { id: 'd', text: 'It is not necessary.', text_vi: 'Nó không cần thiết.' },
                ],
                answer: 'b',
                explanation_en: 'Explanation reduces fear and helps patient stay still — critical for pad placement.',
                explanation_vi: 'Giải thích giảm sợ và giúp bệnh nhân nằm yên — quan trọng cho đặt miếng.',
              },
              {
                id: 'm10l3q2',
                type: 'mcq',
                prompt_en: '"In case your heart needs a shock" — why use this phrase?',
                prompt_vi: '"In case your heart needs a shock" — tại sao dùng cụm từ này?',
                options: [
                  { id: 'a', text: 'To tell the patient they will definitely get a shock.', text_vi: 'Để nói với bệnh nhân họ chắc chắn sẽ bị sốc.' },
                  { id: 'b', text: 'To explain the purpose honestly without causing unnecessary panic — preparation, not certainty.', text_vi: 'Để giải thích mục đích chân thật mà không gây hoảng loạn không cần thiết — chuẩn bị, không chắc chắn.' },
                  { id: 'c', text: 'To avoid explaining.', text_vi: 'Để tránh giải thích.' },
                  { id: 'd', text: 'Only for doctors.', text_vi: 'Chỉ cho bác sĩ.' },
                ],
                answer: 'b',
                explanation_en: '"In case" signals preparation, not inevitability — honest but not alarming.',
                explanation_vi: '"In case" báo hiệu chuẩn bị, không phải chắc chắn — chân thật nhưng không gây báo động.',
              },
              {
                id: 'm10l3q3',
                type: 'mcq',
                prompt_en: 'When gaining rapid consent for an emergency procedure, you should:',
                prompt_vi: 'Khi xin đồng ý nhanh cho thủ thuật khẩn cấp, bạn nên:',
                options: [
                  { id: 'a', text: 'Skip consent — it is an emergency.', text_vi: 'Bỏ qua đồng ý — đây là cấp cứu.' },
                  { id: 'b', text: 'Give brief explanation, state what you need, ask permission — balance urgency with respect.', text_vi: 'Đưa giải thích ngắn, nêu điều bạn cần, xin phép — cân bằng khẩn cấp với tôn trọng.' },
                  { id: 'c', text: 'Wait for written consent.', text_vi: 'Chờ đồng ý bằng văn bản.' },
                  { id: 'd', text: 'Only ask the family.', text_vi: 'Chỉ hỏi gia đình.' },
                ],
                answer: 'b',
                explanation_en: 'Brief explanation + rapid consent respects patient autonomy even in emergencies.',
                explanation_vi: 'Giải thích ngắn + đồng ý nhanh tôn trọng quyền tự chủ bệnh nhân ngay cả trong cấp cứu.',
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
      title: 'Gaining Rapid Consent for NG Tube',
      title_vi: 'Xin Đồng ý Nhanh cho Ống Thông Mũi Dạ dày',
      description: 'A patient needs an NG tube. Learn to explain and gain consent quickly while the patient is distressed.',
      description_vi: 'Bệnh nhân cần ống thông mũi dạ dày. Học cách giải thích và xin đồng ý nhanh khi bệnh nhân đau khổ.',
      stage: 'heads_down',
      order_index: 4,
      est_minutes: 15,
      objective: 'Apply procedure explanation language for NG tube insertion.',
      steps: [
        {
          type: 'scenario_intro',
          title: 'A&E — Patient Needs NG Tube',
          title_vi: 'Cấp cứu — Bệnh nhân Cần Ống Thông Mũi Dạ dày',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            setting_en: 'A&E — Abdominal Emergency',
            setting_vi: 'Cấp cứu — Cấp cứu Bụng',
            context_en: 'Mr. Ahmed, 48, has severe abdominal pain. The doctor has ordered an NG tube to decompress his stomach. He is in pain and anxious. You need to explain the procedure briefly and gain his permission. He may feel discomfort when the tube passes through his nose.',
            context_vi: 'Ông Ahmed, 48 tuổi, đau bụng dữ dội. Bác sĩ đã chỉ định ống thông mũi dạ dày để giảm áp dạ dày. Ông đau và lo lắng. Bạn cần giải thích thủ thuật ngắn gọn và xin phép. Ông có thể cảm thấy khó chịu khi ống đi qua mũi.',
            key_phrases: [
              { en: 'I need to put a tube through your nose.', vi: 'Tôi cần đặt ống qua mũi bạn.' },
              { en: 'This will help your stomach.', vi: 'Điều này sẽ giúp dạ dày bạn.' },
              { en: 'You may feel discomfort.', vi: 'Bạn có thể cảm thấy khó chịu.' },
              { en: 'I need your permission to do this quickly.', vi: 'Tôi cần sự đồng ý của bạn để làm điều này nhanh.' },
              { en: 'I will explain everything as I go.', vi: 'Tôi sẽ giải thích mọi thứ khi tôi làm.' },
            ],
            _instructions: 'AUDIO PRODUCER: 15-20 sec A&E ambient — abdominal emergency, patient in pain. No dialogue. Mood: urgent.',
          },
        },
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Explains NG Tube',
          title_vi: 'Nghe: Điều dưỡng Giải thích Ống Thông Mũi Dạ dày',
          order_index: 2,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse Linh: Mr. Ahmed, I need to put a tube through your nose into your stomach. This will help your stomach — it will relieve the pressure. You may feel discomfort when it goes in. I need your permission to do this quickly. I will explain everything as I go. Try to swallow when I ask you to. That will help the tube go down.\nPatient: Will it hurt?\nNurse Linh: You may feel discomfort — like something in your throat. It will pass. I will be as quick as I can. Ready?",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Linh (calm, clear), Patient Ahmed (in pain, anxious). A&E. Duration: 38-42 sec. Slow speed 0.8x.',
          },
        },
        {
          type: 'script_read',
          title: 'Read the NG Tube Explanation',
          title_vi: 'Đọc Giải thích Ống Thông Mũi Dạ dày',
          order_index: 3,
          config: {
            script: "Nurse: I need to put a tube through your nose into your stomach. This will help your stomach — it will relieve the pressure. You may feel discomfort. I need your permission to do this quickly. I will explain everything as I go. Try to swallow when I ask you to.\nPatient: Will it hurt?\nNurse: You may feel discomfort — like something in your throat. Ready?",
          },
        },
        {
          type: 'cloze',
          title: 'Complete the NG Tube Explanation',
          title_vi: 'Hoàn thành Giải thích Ống Thông Mũi Dạ dày',
          order_index: 4,
          config: {
            cloze: "Nurse: I need to put a ___ through your nose into your ___. This will help your stomach — it will ___ the pressure.\nYou may feel ___. I need your ___ to do this quickly. I will ___ everything as I go.\nTry to ___ when I ask you to.",
            script: "Nurse: I need to put a tube through your nose into your stomach. This will help your stomach — it will relieve the pressure.\nYou may feel discomfort. I need your permission to do this quickly. I will explain everything as I go.\nTry to swallow when I ask you to.",
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 5 — HEADS DOWN  (audio_shadow → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Explaining Catheter Insertion',
      title_vi: 'Giải thích Đặt Ống Thông Tiểu',
      description: 'A patient needs a urinary catheter. Practice explaining the procedure and gaining consent. Record yourself.',
      description_vi: 'Bệnh nhân cần ống thông tiểu. Thực hành giải thích thủ thuật và xin đồng ý. Ghi âm.',
      stage: 'heads_down',
      order_index: 5,
      est_minutes: 18,
      objective: 'Deliver procedure explanation for catheter insertion independently.',
      steps: [
        {
          type: 'audio_shadow',
          title: 'Listen: Nurse Explains Catheter',
          title_vi: 'Nghe: Điều dưỡng Giải thích Ống Thông Tiểu',
          order_index: 1,
          config: {
            audio_url: 'PLACEHOLDER',
            speed: 'slow',
            transcript: "Nurse Anh: Mrs. Nguyen, I need to put a small tube into your bladder to drain the urine. This will help us measure your output. You may feel a sharp sting for a moment. I need your permission to do this quickly. I will explain everything as I go. I will use gel to make it more comfortable. Try to relax.\nPatient: Is it necessary?\nNurse Anh: Yes, the doctor has ordered it. This will help us monitor you. You may feel a sharp sting when the tube goes in. It will only last a second. Ready?",
            _instructions: 'AUDIO PRODUCER: Two speakers — Nurse Anh (professional, gentle), Patient Nguyen (embarrassed, anxious). Ward. Duration: 38-42 sec. Slow speed 0.8x.',
          },
        },
        {
          type: 'cloze',
          title: 'Build the Catheter Explanation',
          title_vi: 'Xây dựng Giải thích Ống Thông Tiểu',
          order_index: 2,
          config: {
            cloze: "Nurse: I need to put a small ___ into your bladder to ___ the urine. This will help us ___ your output.\nYou may feel a sharp ___ for a moment. I need your ___ to do this quickly.\nI will ___ everything as I go. I will use ___ to make it more comfortable.",
            script: "Nurse: I need to put a small tube into your bladder to drain the urine. This will help us measure your output.\nYou may feel a sharp sting for a moment. I need your permission to do this quickly.\nI will explain everything as I go. I will use gel to make it more comfortable.",
          },
        },
        {
          type: 'no_script',
          title: 'Speak It — No Script',
          title_vi: 'Nói — Không Kịch bản',
          order_index: 3,
          config: {
            context: 'You need to explain IV insertion to an anxious patient. Use the key procedure phrases.',
            cues: [
              '"I need to put a needle in your arm"',
              '"This will help..." (state benefit)',
              '"You may feel a sharp sting"',
              '"I need your permission to do this quickly"',
              '"I will explain everything as I go"',
            ],
            timer_seconds: 90,
            timer_visible: true,
          },
        },
        {
          type: 'recording_submit',
          title: 'Record Your Procedure Explanation',
          title_vi: 'Ghi âm Giải thích Thủ thuật của Bạn',
          order_index: 4,
          config: {
            prompt_en: 'Record yourself explaining an IV or oxygen procedure to an anxious patient. Use at least four key phrases from this module.',
            prompt_vi: 'Ghi âm bạn giải thích thủ thuật truyền tĩnh mạch hoặc oxy cho bệnh nhân lo lắng. Sử dụng ít nhất bốn cụm từ chính từ module này.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'Record yourself as the nurse. Include: "I need to put...", "This will help...", "You may feel...", "I need your permission to do this quickly", "I will explain everything as I go". Aim for 35-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 6 — HEADS TOGETHER  (script_read → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Pair Practice — Nurse to Patient: IV Explanation',
      title_vi: 'Luyện tập Cặp — Điều dưỡng đến Bệnh nhân: Giải thích Truyền tĩnh mạch',
      description: 'Work with a partner. One plays the nurse explaining IV, one plays the anxious patient. Practice procedure language.',
      description_vi: 'Làm việc với đối tác. Một người đóng vai điều dưỡng giải thích truyền tĩnh mạch, một người đóng vai bệnh nhân lo lắng. Thực hành ngôn ngữ thủ thuật.',
      stage: 'heads_together',
      order_index: 6,
      est_minutes: 20,
      objective: 'Practice procedure explanation with a partner.',
      steps: [
        {
          type: 'script_read',
          title: 'Full Script — Nurse Explains IV to Patient',
          title_vi: 'Kịch bản Đầy đủ — Điều dưỡng Giải thích Truyền tĩnh mạch cho Bệnh nhân',
          order_index: 1,
          config: {
            script: "Nurse: I need to put a needle in your arm. This will help us give you fluids and medication. You may feel a sharp sting for a moment. I need your permission to do this quickly. I will explain everything as I go. Can you hold your arm still?\nPatient: Yes. Will it take long?\nNurse: No. You may feel a sharp sting when the needle goes in. It will only last a second. I will be as quick as I can. Ready?",
          },
        },
        {
          type: 'cloze',
          title: 'Round 2 — Partial Script',
          title_vi: 'Vòng 2 — Kịch bản Một phần',
          order_index: 2,
          config: {
            cloze: "Nurse: I need to put a ___ in your arm. This will help us give you ___ and medication.\nYou may feel a sharp ___. I need your ___ to do this quickly. I will ___ everything as I go.\nReady?",
            script: "Nurse: I need to put a needle in your arm. This will help us give you fluids and medication.\nYou may feel a sharp sting. I need your permission to do this quickly. I will explain everything as I go.\nReady?",
          },
        },
        {
          type: 'no_script',
          title: 'Round 3 — Cue Cards Only',
          title_vi: 'Vòng 3 — Chỉ Thẻ Gợi ý',
          order_index: 3,
          config: {
            context: 'Nurse A: Explain oxygen mask to anxious patient. Nurse B: Play the patient. Switch roles.',
            cues: [
              '"I need to put..." (mask/needle/tube)',
              '"This will help you breathe better"',
              '"You may feel..."',
              '"I need your permission to do this quickly"',
              '"I will explain everything as I go"',
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
            prompt_en: 'Record your best performance as the nurse explaining a procedure to a patient.',
            prompt_vi: 'Ghi âm phần trình diễn tốt nhất của bạn với vai điều dưỡng giải thích thủ thuật cho bệnh nhân.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'PAIR PRACTICE: Complete all three rounds. Submit ONE recording — your best as the nurse. Include at least three key procedure phrases. Aim for 30-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 7 — HEADS TOGETHER  (script_read → cloze → no_script → recording_submit)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Pair Practice — Gaining Rapid Consent',
      title_vi: 'Luyện tập Cặp — Xin Đồng ý Nhanh',
      description: 'Practice gaining rapid consent for different procedures. One plays the nurse, one plays the patient.',
      description_vi: 'Thực hành xin đồng ý nhanh cho các thủ thuật khác nhau. Một người đóng vai điều dưỡng, một người đóng vai bệnh nhân.',
      stage: 'heads_together',
      order_index: 7,
      est_minutes: 20,
      objective: 'Practice gaining rapid consent with a partner.',
      steps: [
        {
          type: 'script_read',
          title: 'Full Script — Nurse Gains Consent for Defibrillator',
          title_vi: 'Kịch bản Đầy đủ — Điều dưỡng Xin Đồng ý cho Sốc điện',
          order_index: 1,
          config: {
            script: "Nurse: I need to put these pads on your chest. They are for the defibrillator. You may feel a sharp sting when I apply the gel. I need your permission to do this quickly. I will explain everything as I go. Please stay still.\nPatient: What if you need to shock me?\nNurse: We are monitoring you. These pads help us be prepared. Try to stay calm. Ready?",
          },
        },
        {
          type: 'cloze',
          title: 'Round 2 — Partial Script',
          title_vi: 'Vòng 2 — Kịch bản Một phần',
          order_index: 2,
          config: {
            cloze: "Nurse: I need to put these ___ on your chest. They are for the ___.\nYou may feel a sharp ___. I need your ___ to do this quickly.\nI will ___ everything as I go. Please stay ___.",
            script: "Nurse: I need to put these pads on your chest. They are for the defibrillator.\nYou may feel a sharp sting. I need your permission to do this quickly.\nI will explain everything as I go. Please stay still.",
          },
        },
        {
          type: 'no_script',
          title: 'Round 3 — Cue Cards Only',
          title_vi: 'Vòng 3 — Chỉ Thẻ Gợi ý',
          order_index: 3,
          config: {
            context: 'Nurse A: Gain consent for NG tube. Nurse B: Play the patient. Switch roles.',
            cues: [
              'Explain what you will do',
              '"This will help..."',
              '"You may feel..."',
              '"I need your permission to do this quickly"',
              '"I will explain everything as I go"',
            ],
            timer_seconds: 90,
            timer_visible: true,
          },
        },
        {
          type: 'recording_submit',
          title: 'Record Your Consent Request',
          title_vi: 'Ghi âm Yêu cầu Đồng ý của Bạn',
          order_index: 4,
          config: {
            prompt_en: 'Record yourself gaining rapid consent for a procedure (IV, oxygen, or NG tube).',
            prompt_vi: 'Ghi âm bạn xin đồng ý nhanh cho thủ thuật (truyền tĩnh mạch, oxy hoặc ống thông mũi dạ dày).',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: 'Record yourself as the nurse. Include: "I need to...", "This will help...", "You may feel...", "I need your permission to do this quickly", "I will explain everything as I go". Aim for 30-45 seconds.',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // LESSON 8 — ASSESSMENT  (quiz → cloze → recording_submit → self_reflection)
    // ══════════════════════════════════════════════════════════════════════════
    {
      title: 'Module Assessment — Procedures & Self-Reflection',
      title_vi: 'Kiểm tra Module — Thủ thuật & Tự Phản ánh',
      description: 'A comprehensive assessment of procedure explanation language. Finish by reflecting on what you have learned.',
      description_vi: 'Đánh giá toàn diện về ngôn ngữ giải thích thủ thuật. Kết thúc bằng phản ánh những gì bạn đã học.',
      stage: 'assessment',
      order_index: 8,
      est_minutes: 25,
      objective: 'Demonstrate Module 10 procedure explanation language.',
      steps: [
        {
          type: 'quiz',
          title: 'Module 10 Knowledge Check',
          title_vi: 'Kiểm tra Kiến thức Module 10',
          order_index: 1,
          config: {
            questions: [
              {
                id: 'm10l8q1',
                type: 'mcq',
                prompt_en: '[Part A — Vocabulary] "I need to put a needle in your arm" — what does this achieve?',
                prompt_vi: '[Phần A — Từ vựng] "I need to put a needle in your arm" — đạt được gì?',
                options: [
                  { id: 'a', text: 'It scares the patient.', text_vi: 'Nó làm bệnh nhân sợ.' },
                  { id: 'b', text: 'It gives clear, honest information before the procedure — builds trust.', text_vi: 'Nó đưa thông tin rõ ràng, chân thật trước thủ thuật — xây dựng lòng tin.' },
                  { id: 'c', text: 'It is only for IV.', text_vi: 'Chỉ cho truyền tĩnh mạch.' },
                  { id: 'd', text: 'It avoids consent.', text_vi: 'Nó tránh xin đồng ý.' },
                ],
                answer: 'b',
                explanation_en: 'Clear explanation before procedures reduces anxiety and improves cooperation.',
                explanation_vi: 'Giải thích rõ trước thủ thuật giảm lo lắng và cải thiện hợp tác.',
              },
              {
                id: 'm10l8q2',
                type: 'mcq',
                prompt_en: '[Part B — Protocol] "You may feel a sharp sting" — why say this?',
                prompt_vi: '[Phần B — Quy trình] "You may feel a sharp sting" — tại sao nói?',
                options: [
                  { id: 'a', text: 'To make the patient refuse.', text_vi: 'Để làm bệnh nhân từ chối.' },
                  { id: 'b', text: 'To set realistic expectations — patient is prepared and less likely to move.', text_vi: 'Để đặt kỳ vọng thực tế — bệnh nhân được chuẩn bị và ít cử động.' },
                  { id: 'c', text: 'Only for needles.', text_vi: 'Chỉ cho kim.' },
                  { id: 'd', text: 'It is not important.', text_vi: 'Nó không quan trọng.' },
                ],
                answer: 'b',
                explanation_en: 'Warning about sensation prepares the patient — reduces surprise during procedure.',
                explanation_vi: 'Cảnh báo về cảm giác chuẩn bị bệnh nhân — giảm bất ngờ trong thủ thuật.',
              },
              {
                id: 'm10l8q3',
                type: 'mcq',
                prompt_en: '[Part C — Communication] "I will explain everything as I go" — what does this communicate?',
                prompt_vi: '[Phần C — Giao tiếp] "I will explain everything as I go" — truyền đạt điều gì?',
                options: [
                  { id: 'a', text: 'The nurse will talk too much.', text_vi: 'Điều dưỡng sẽ nói quá nhiều.' },
                  { id: 'b', text: 'The patient will be informed step by step — reduces anxiety, builds trust.', text_vi: 'Bệnh nhân sẽ được thông báo từng bước — giảm lo lắng, xây dựng lòng tin.' },
                  { id: 'c', text: 'The procedure will be slow.', text_vi: 'Thủ thuật sẽ chậm.' },
                  { id: 'd', text: 'Only for complex procedures.', text_vi: 'Chỉ cho thủ thuật phức tạp.' },
                ],
                answer: 'b',
                explanation_en: 'This phrase reassures the patient of continuous communication during the procedure.',
                explanation_vi: 'Cụm từ này trấn an bệnh nhân về giao tiếp liên tục trong thủ thuật.',
              },
              {
                id: 'm10l8q4',
                type: 'mcq',
                prompt_en: '[Part D — Decision] A conscious patient needs defibrillator pads. You should:',
                prompt_vi: '[Phần D — Quyết định] Bệnh nhân tỉnh cần miếng sốc điện. Bạn nên:',
                options: [
                  { id: 'a', text: 'Put them on without saying anything.', text_vi: 'Đặt lên mà không nói gì.' },
                  { id: 'b', text: 'Briefly explain what you will do, what they may feel, and gain permission quickly.', text_vi: 'Giải thích ngắn bạn sẽ làm gì, họ có thể cảm thấy gì, và xin phép nhanh.' },
                  { id: 'c', text: 'Wait for the doctor to explain.', text_vi: 'Chờ bác sĩ giải thích.' },
                  { id: 'd', text: 'Skip consent — it is an emergency.', text_vi: 'Bỏ qua đồng ý — đây là cấp cứu.' },
                ],
                answer: 'b',
                explanation_en: 'Brief explanation + rapid consent — respects patient even in emergency.',
                explanation_vi: 'Giải thích ngắn + đồng ý nhanh — tôn trọng bệnh nhân ngay cả trong cấp cứu.',
              },
            ],
          },
        },
        {
          type: 'cloze',
          title: 'Complete the Full Procedure Explanation',
          title_vi: 'Hoàn thành Giải thích Thủ thuật Đầy đủ',
          order_index: 2,
          config: {
            cloze: "Nurse: I need to ___ a [needle/mask/tube] in/on your [arm/face/nose]. This will help you ___.\nYou may feel a sharp ___ or ___. I need your ___ to do this quickly.\nI will ___ everything as I go.",
            script: "Nurse: I need to put a [needle/mask/tube] in/on your [arm/face/nose]. This will help you [breathe/receive medication].\nYou may feel a sharp sting or discomfort. I need your permission to do this quickly.\nI will explain everything as I go.",
          },
        },
        {
          type: 'recording_submit',
          title: 'Final Assessment Recording',
          title_vi: 'Ghi âm Đánh giá Cuối cùng',
          order_index: 3,
          config: {
            prompt_en: 'Record yourself explaining a procedure and gaining consent. Use all five key phrases from this module.',
            prompt_vi: 'Ghi âm bạn giải thích thủ thuật và xin đồng ý. Sử dụng cả năm cụm từ chính từ module này.',
            timer_seconds: 90,
            rubric: {
              clear: true,
              polite: true,
              complete: true,
              keywords: true,
            },
            _instructions: '[FINAL ASSESSMENT] You are Nurse [Your Name]. Explain IV, oxygen, or NG tube to an anxious patient. Include: "I need to put...", "This will help...", "You may feel...", "I need your permission to do this quickly", "I will explain everything as I go". Aim for 40-50 seconds.',
          },
        },
        {
          type: 'self_reflection',
          title: 'Module 10 Self-Reflection',
          title_vi: 'Tự Phản ánh Module 10',
          order_index: 4,
          config: {
            prompts: [
              { key: 'confidence', type: 'slider', label_en: 'How confident do you feel explaining procedures in English now?', label_vi: 'Bạn cảm thấy tự tin giải thích thủ thuật bằng tiếng Anh chưa?' },
              { key: 'usefulness', type: 'slider', label_en: 'How useful was this module for your real clinical work?', label_vi: 'Module này có hữu ích cho công việc lâm sàng thực tế của bạn không?' },
              { key: 'difficulty', type: 'slider', label_en: 'How difficult was the procedure language in this module?', label_vi: 'Ngôn ngữ thủ thuật trong module này khó ở mức độ nào?' },
              { key: 'pair_helped', type: 'slider', label_en: 'Did the pair practice (Lessons 6 and 7) help you feel more prepared?', label_vi: 'Luyện tập cặp đôi (Bài 6 và 7) có giúp bạn cảm thấy sẵn sàng hơn không?' },
              { key: 'open_feedback', type: 'text', label_en: 'Which procedure phrase will you try to use on your next shift?', label_vi: 'Bạn sẽ thử dùng cụm từ thủ thuật nào trong ca làm tiếp theo?' },
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
