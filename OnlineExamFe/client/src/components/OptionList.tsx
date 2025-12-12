/**
 * OptionList:
 *  - Component hiển thị danh sách các đáp án để người dùng chọn.
 *  - Hỗ trợ 2 dạng câu hỏi:
 *      + 1 = SINGLE_CHOICE  (chọn 1 đáp án)  -> dùng radio
 *      + 2 = MULTI_CHOICE   (chọn nhiều đáp án) -> dùng checkbox
 *
 * Input chính:
 *  - options  : danh sách đáp án
 *  - selected : danh sách id đáp án đang được chọn
 *  - onChange : callback để báo lên component cha khi lựa chọn thay đổi
 *
 * Lưu ý:
 *  - Với câu hỏi tự luận (ví dụ type = 3), không nên render component này.
 */

// lựa chọn đáp án
import React from 'react';

/**
 * OptionItem:
 *  - Mô tả một đáp án.
 *  - id  : mã đáp án (dùng để lưu/so sánh, gửi lên BE)
 *  - text: nội dung đáp án hiển thị trên UI
 */
export interface OptionItem {
  id: number;
  text: string;
}

/**
 * Props của OptionList:
 *  - options      : mảng đáp án
 *  - questionType : loại câu hỏi (1 = chọn 1, 2 = chọn nhiều)
 *  - selected     : mảng id đáp án đang được chọn
 *  - onChange     : hàm callback được gọi khi user chọn/bỏ chọn đáp án
 *  - groupName    : tên nhóm input (radio/checkbox) giúp accessibility tốt hơn
 */
export interface OptionListProps {
  options: OptionItem[];

  /**
   * questionType:
   *  - 1: SINGLE_CHOICE  (chọn 1)
   *  - 2: MULTI_CHOICE   (chọn nhiều)
   *  - Các type khác (ví dụ 3 = tự luận) thì component này không phù hợp.
   */
  questionType: number;

  /**
   * selected:
   *  - Mảng các id đáp án đang được chọn.
   *  - Nếu là SINGLE_CHOICE (type=1) thì mảng này thường chỉ có 0 hoặc 1 phần tử.
   *  - Nếu là MULTI_CHOICE (type=2) thì mảng có thể có nhiều phần tử.
   */
  selected: number[];

  /**
   * onChange:
   *  - Callback báo cho component cha khi lựa chọn thay đổi.
   *  - Component cha sẽ cập nhật state của nó dựa vào mảng selected mới.
   *
   * Ví dụ cha dùng:
   *  const [selected, setSelected] = useState<number[]>([]);
   *  <OptionList selected={selected} onChange={setSelected} ... />
   */
  onChange: (selected: number[]) => void;

  /**
   * groupName:
   *  - Tên nhóm input.
   *  - Với radio, name rất quan trọng để đảm bảo chỉ chọn được 1 trong cùng nhóm.
   *  - Với checkbox thì name không bắt buộc, nhưng vẫn hữu ích cho accessibility.
   */
  groupName?: string;
}

/**
 * OptionList component
 */
const OptionList: React.FC<OptionListProps> = ({
  options,
  questionType,
  selected,
  onChange,
  groupName
}) => {
  /**
   * handleSelect:
   *  - Hàm xử lý khi người dùng tick/bỏ tick một đáp án.
   *
   * Tham số:
   *  - id      : id của đáp án người dùng vừa thao tác
   *  - checked : true nếu đang chọn, false nếu bỏ chọn
   *
   * Logic:
   *  - Nếu SINGLE_CHOICE (type=1):
   *      + Nếu checked = true  -> selected = [id]
   *      + Nếu checked = false -> selected = []
   *  - Nếu MULTI_CHOICE (type=2):
   *      + Nếu checked = true  -> thêm id vào mảng selected
   *      + Nếu checked = false -> loại bỏ id khỏi mảng selected
   */
  const handleSelect = (id: number, checked: boolean) => {
    if (questionType === 1) {
      // Chọn 1: chọn thì thay thế toàn bộ bằng [id], bỏ chọn thì về rỗng
      onChange(checked ? [id] : []);
    } else {
      // Chọn nhiều: tick thì thêm vào, bỏ tick thì lọc ra
      const newSelected = checked
        ? [...selected, id]
        : selected.filter((optionId) => optionId !== id);

      onChange(newSelected);
    }
  };

  return (
    /**
     * ul: danh sách các đáp án
     * - role="list": giúp screen reader hiểu đây là danh sách
     */
    <ul className="space-y-3" role="list">
      {options.map((opt) => {
        // Kiểm tra đáp án này hiện có được chọn không
        const isSelected = selected.includes(opt.id);

        // isSingle = true nếu câu hỏi là chọn 1
        const isSingle = questionType === 1;

        return (
          <li key={opt.id}>
            {/**
              * label bọc cả input + text:
              *  - Khi click vào bất kỳ chỗ nào trong label (kể cả chữ),
              *    input sẽ thay đổi trạng thái -> UX tốt hơn.
              *
              * htmlFor trỏ tới id của input (option-<id>) để liên kết label - input.
              */}
            <label
              htmlFor={`option-${opt.id}`}
              className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition
                ${
                  isSelected
                    ? 'border-sky-400/70 bg-white/5 shadow-lg shadow-sky-500/10'
                    : 'border-white/10 bg-white/0 hover:border-white/25'
                }`}
            >
              {/**
               * input thật sự (radio/checkbox) nhưng bị ẩn bằng class "sr-only"
               *  - sr-only: ẩn khỏi màn hình nhưng vẫn tồn tại cho screen reader.
               *  - Tại sao ẩn?
               *      + Để tự vẽ giao diện chọn (vòng tròn/ô vuông) bằng <span> phía dưới
               *      + UI đẹp và đồng nhất hơn.
               *
               * type:
               *  - 'radio' nếu chọn 1
               *  - 'checkbox' nếu chọn nhiều
               *
               * name:
               *  - Với radio, cùng name => chỉ được chọn 1 trong nhóm đó.
               *  - groupName cho phép truyền từ ngoài vào để tránh đụng tên với nhóm khác.
               *
               * checked:
               *  - Là trạng thái input được điều khiển bởi React (controlled component).
               *  - Nguồn sự thật nằm ở props selected[].
               */}
              <input
                type={isSingle ? 'radio' : 'checkbox'}
                name={groupName || 'option-group'}
                id={`option-${opt.id}`}
                className="sr-only"
                checked={isSelected}
                onChange={(e) => handleSelect(opt.id, e.target.checked)}
              />

              {/**
               * span này là "UI giả" để hiển thị trạng thái được chọn.
               * - Với checkbox: hiển thị ô vuông nhỏ bên trong khi chọn.
               * - Với radio: hiển thị chấm tròn bên trong khi chọn.
               *
               * role="presentation": nói với screen reader đây chỉ là trang trí.
               */}
              <span
                className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border transition
                  ${
                    isSelected
                      ? 'border-sky-300 bg-sky-500/30'
                      : 'border-white/20 bg-white/5'
                  }`} 
                role="presentation"
              >
                {/* Nếu là MULTI_CHOICE -> hiển thị ô vuông nhỏ như checkbox */}
                {!isSingle && (
                  <span
                    className={`h-2.5 w-2.5 rounded-sm ${
                      isSelected ? 'bg-white' : 'bg-transparent'
                    }`}
                  />
                )}

                {/* Nếu là SINGLE_CHOICE -> hiển thị chấm tròn nhỏ như radio */}
                {isSingle && (
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-transparent'
                    }`}
                  />
                )}
              </span>

              {/* Text đáp án hiển thị */}
              <span className="flex-1 text-sm leading-relaxed text-slate-100">
                {opt.text}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
};

export default OptionList;
