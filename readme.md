## Phở Bò | Bot nối từ tiếng Việt
BOT nối từ tiếng Việt trên Discord!

## Nguồn ngữ liệu tiếng Việt
> https://github.com/undertheseanlp/dictionary (có chỉnh sửa để phù hợp với trò chơi)

## Cài đặt BOT trên server riêng
### Yêu cầu
- Hệ điều hành: `Linux, MacOS, Windows`, có cài đặt:
  - `NodeJS >= 18` (BOT được phát triển trên `NodeJS 20.x`)
  - Có cài đặt gói `yarn` (`npm i -g yarn`)
  - Git

### Cài đặt
- Clone repo về máy:
```bash
git clone https://github.com/lvdat/bot-noi-tu && cd bot-noi-tu
```
- Cài đặt các gói cần thiết:
```bash
yarn
```
- Tạo tệp tin `.env` với nội dung là **TOKEN của BOT** đã tạo trong Discord Developer Portal
```bash
BOT_TOKEN=...
```
- Chạy BOT lần đầu để tạo các file cần thiết
```bash
node bot
```
> Backup các file trong thư mục `data` để lưu lại và phục hồi dữ liệu khi cần thiết.
- Tạo link mời BOT vào máy chủ
  - Trong bảng điều khiển BOT, chọn Tab `OAuth2`

 ![image](https://github.com/lvdat/bot-noi-tu/assets/72507371/1a83d38d-2d2b-4066-bb9e-fddfa4a6cecc)
 
  - Chọn scope

  ![image](https://github.com/lvdat/bot-noi-tu/assets/72507371/9dba916d-4cf5-4c40-8670-8f7740cc9647)

  - Chọn BOT permission:

  ![image](https://github.com/lvdat/bot-noi-tu/assets/72507371/599a47e7-21e6-40fe-ae58-895509c059e2)

  - Copy URL trong trường `GENERATED URL` và mở trong trình duyệt.

## Các lệnh của BOT
|        **Lệnh**        |         **Chức năng**         |   **Quyền cần**   |
|:----------------------:|:-----------------------------:|:-----------------:|
| /set-channel <channel> | Cài đặt kênh chơi nối từ      | `MANAGE_CHANNELS` |
| /help                  | Xem thông tin và các lệnh BOT |                   |
| !start                 | Bắt đầu lượt chơi nối từ      |                   |
| !stop                  | Kết thúc lượt chơi nối từ     | `MANAGE_CHANNELS` |

