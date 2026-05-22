# CSV import

Trang import nằm tại `/devotees/import` và API xử lý là `POST /api/devotees/import`.

## Mục tiêu

Import CSV được thiết kế theo hướng an toàn cho dữ liệu chùa:

1. Upload file CSV.
2. Server đọc header và tự map cột về field trong bảng `devotees`.
3. Validate từng dòng bằng cùng schema với form tạo hồ sơ thủ công.
4. Kiểm tra trùng trong chính file CSV.
5. Kiểm tra trùng với dữ liệu đang có trong database.
6. Preview lỗi/cảnh báo trước.
7. Khi bấm import, server parse lại file và chỉ insert các dòng không có lỗi.

## Field hỗ trợ

Cột bắt buộc duy nhất là `full_name` / `Họ và tên`.

Các field hiện được import vào bảng `devotees`:

- `family_registry_no` — Số danh bộ gia đình
- `bhd_registry_no` — Số danh bộ BHD
- `full_name` — Họ và tên
- `birth_date` — Ngày sinh
- `birth_place` — Nơi sinh
- `dharma_name` — Pháp danh
- `hometown` — Quê quán
- `address` — Địa chỉ
- `joined_unit_date` — Ngày vào Đơn vị
- `vow_date` — Ngày Phát nguyện
- `refuge_date` — Ngày Quy y
- `preceptor` — Bổn Sư truyền giới
- `father_name` — Tên Cha
- `mother_name` — Tên Mẹ

Header có thể viết có dấu, không dấu, tiếng Anh, hoặc snake_case. Ví dụ `Họ và tên`, `ho ten`, `full_name`, `full name` đều map về `full_name`.

## Format ngày

Server chấp nhận:

- `YYYY-MM-DD`
- `DD/MM/YYYY`
- `DD-MM-YYYY`

Trước khi validate, các ngày dạng `DD/MM/YYYY` và `DD-MM-YYYY` được đổi thành `YYYY-MM-DD`.

## Logic phát hiện trùng

Các lỗi trùng bị chặn import:

- Trùng `family_registry_no` trong file CSV.
- Trùng `bhd_registry_no` trong file CSV.
- `family_registry_no` đã tồn tại trong database.
- `bhd_registry_no` đã tồn tại trong database.
- Trùng tổ hợp `full_name + birth_date + father_name + mother_name` với database.

Các cảnh báo không chặn import:

- Không có số danh bộ gia đình hoặc số danh bộ BHD.
- Có vẻ trùng `full_name + birth_date + father_name + mother_name` trong chính file CSV.

## Giới hạn hiện tại

- Tối đa 10,000 dòng dữ liệu/lần import.
- Tối đa 2MB/file CSV.
- Preview UI hiển thị 200 dòng đầu tiên, nhưng summary vẫn tính trên toàn bộ file.
- Import hiện chỉ ghi vào bảng chính `devotees`, chưa import các bảng phụ như training, roles, notes, afterlife.

## Ví dụ CSV

```csv
Họ và tên,Ngày sinh,Pháp danh,Quê quán,Số danh bộ gia đình,Tên Cha,Tên Mẹ
Nguyễn Văn A,01/02/1960,Quảng Đức,Huế,GĐ-001,Nguyễn Văn B,Trần Thị C
Trần Thị D,1975-05-20,Tâm An,Đà Nẵng,GĐ-002,Trần Văn E,Lê Thị F
```
