/**
 * QuestionCard: Component hiển thị 1 câu hỏi trong phòng thi.
 *
 * Nhiệm vụ chính:
 * - Hiển thị nội dung câu hỏi.
 * - Nếu là câu trắc nghiệm:
 *    + Hiển thị danh sách đáp án (OptionList).
 *    + Cho phép chọn 1 đáp án (single choice) hoặc nhiều đáp án (multi choice).
 * - Nếu là câu tự luận (essay):
 *    + Hiển thị ô textarea để nhập câu trả lời.
 *
 * Component này KHÔNG tự lưu đáp án vào database.
 * Nó chỉ gọi callback `onAnswer(...)` để báo cho component cha (ExamRoomPage)
 * biết học sinh vừa chọn/nhập gì để:
 * - lưu vào state
 * - gọi WebSocket/REST gửi về backend
 * - autosave (tự lưu) nếu muốn
 */

import React from 'react';
import OptionList, { OptionItem } from './OptionList';

/**
 * Props = dữ liệu + hàm mà component cha truyền xuống.
 * Nhờ props, QuestionCard hiển thị đúng câu hỏi và báo lại câu trả lời cho cha.
 */
export interface QuestionCardProps {
    /**
     * ID duy nhất của câu hỏi.
     * (Ví dụ: id của bản ghi QuestionExam trong DB)
     */
    questionId: number;

    /**
     * Thứ tự hiển thị câu hỏi trên màn hình (ví dụ: Câu 1, Câu 2,...).
     * Có thể không truyền (undefined) nếu không cần hiển thị.
     */
    orderIndex?: number;

    /** Nội dung câu hỏi hiển thị cho học sinh */
    text: string;

    /**
     * Loại câu hỏi:
     * 1 = SINGLE_CHOICE (chọn 1 đáp án)
     * 2 = MULTI_CHOICE  (chọn nhiều đáp án)
     * 3 = ESSAY         (tự luận, nhập text)
     */
    questionType: number;

    /**
     * Danh sách đáp án (chỉ dùng cho trắc nghiệm).
     * Với tự luận thì thường không có options.
     */
    options?: OptionItem[];

    /**
     * Danh sách đáp án đang được chọn (chỉ dùng cho trắc nghiệm).
     * - Single choice: thường chỉ có 0 hoặc 1 phần tử
     * - Multi choice: có thể nhiều phần tử
     */
    selectedOptions?: number[];

    /**
     * Callback để báo cho component cha khi câu trả lời thay đổi.
     *
     * - Với trắc nghiệm: trả về mảng number[] (id option đã chọn)
     * - Với tự luận: trả về string (nội dung học sinh gõ)
     *
     * Component cha sẽ quyết định làm gì: setState, autosave, gửi WS, ...
     */
    onAnswer: (answer: number[] | string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
    questionId,
    orderIndex,
    text,
    questionType,
    options = [],
    selectedOptions = [],
    onAnswer,
}) => {
    /**
     * Khi OptionList báo "đáp án đã thay đổi",
     * ta chỉ đơn giản gọi onAnswer(...) để báo cho component cha.
     */
    const handleOptionChange = (selected: number[]) => {
        onAnswer(selected);
    };

    /**
     * Khi học sinh gõ câu trả lời tự luận (textarea),
     * ta lấy giá trị mới từ e.target.value và báo cho component cha.
     */
    const handleEssayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onAnswer(e.target.value);
    };

    return (
        <article className="glass-card p-6 space-y-4">
            {/* Nếu có orderIndex thì hiển thị nhãn "Question {orderIndex}" */}
            {orderIndex !== undefined && (
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sky-100">
                    {/* chấm xanh chỉ để trang trí UI */}
                    <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                    Question {orderIndex}
                </div>
            )}

            {/* Nội dung câu hỏi */}
            <h2 className="text-lg font-semibold text-white leading-relaxed">{text}</h2>

            {/* Nếu là tự luận (type=3) thì hiển thị ô nhập */}
            {questionType === 3 ? (
                <textarea
                    className="w-full border rounded-xl p-3 resize-y bg-white/5 placeholder:text-slate-400 text-slate-100"
                    rows={5}
                    onChange={handleEssayChange}
                    placeholder="Nhập câu trả lời ở đây..."
                />
            ) : (
                /**
                 * Nếu là trắc nghiệm (type=1 hoặc type=2) thì dùng OptionList.
                 *
                 * groupName quan trọng cho input type="radio":
                 * - radio muốn "chỉ chọn 1" thì các radio phải cùng `name`.
                 * - ở đây ta đặt theo questionId để mỗi câu hỏi là 1 nhóm riêng.
                 */
                <OptionList
                    options={options}
                    questionType={questionType}
                    selected={selectedOptions}
                    onChange={handleOptionChange}
                    groupName={`question-${questionId}`}
                />
            )}
        </article>
    );
};

export default QuestionCard;