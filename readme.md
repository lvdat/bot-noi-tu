## Phở Bò | Bot nối từ tiếng Việt
BOT nối từ tiếng Việt trên Discord! | [INVITE ME!](https://discord.com/oauth2/authorize?client_id=1211679955143106670) | [Discord Support Server](https://discord.gg/TFvSWf9SBb)

## Nguồn ngữ liệu tiếng Việt
> https://github.com/undertheseanlp/dictionary (ngữ liệu chính, có chỉnh sửa để phù hợp với trò chơi)

> https://github.com/lvdat/phobo-contribute-words (ngữ liệu đóng góp bởi cộng đồng ở [Discord Support Server](https://discord.gg/TFvSWf9SBb))

## Cài đặt BOT trên server riêng
> Tham gia vào Discord Support để được hỗ trợ self-hosted Bot.
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
> Không bắt buộc: config thêm `REPORT_CHANNEL` để có thể dùng lệnh report.
- Chạy BOT lần đầu để tạo các file cần thiết
```bash
node bot
```
> Backup các file trong thư mục `data` để lưu lại và phục hồi dữ liệu khi cần thiết.
- Tạo link mời BOT vào máy chủ
  - Trong bảng điều khiển, chọn Tab `Installation` và tích chọn `Guild Install`
    ![image](https://github.com/lvdat/bot-noi-tu/assets/72507371/638fda71-7378-409e-9e23-be04a6b8597a)
  - Ở phần Install Link chọn `Discord Provided Link` và chọn các scope trong phần Default Install Settings như sau
   ![image](https://github.com/lvdat/bot-noi-tu/assets/72507371/c642a73d-e1a5-4c02-86f8-2e9156825f16)
  - Click nút `Copy` ở link phía trên và dán vào trình duyệt để mời BOT!

<details>
  <summary>Trường hợp không có trường Installation hoặc Discord Provided Link</summary>
  
  - Trong bảng điều khiển BOT, chọn Tab `OAuth2`

 ![image](https://github.com/lvdat/bot-noi-tu/assets/72507371/1a83d38d-2d2b-4066-bb9e-fddfa4a6cecc)
 
  - Chọn scope

  ![image](https://github.com/lvdat/bot-noi-tu/assets/72507371/9dba916d-4cf5-4c40-8670-8f7740cc9647)

  - Chọn BOT permission:

  ![image](https://github.com/lvdat/bot-noi-tu/assets/72507371/599a47e7-21e6-40fe-ae58-895509c059e2)

  - Copy URL trong trường `GENERATED URL` và mở trong trình duyệt.
</details>
  

## Các lệnh của BOT
|        **Lệnh**        |         **Chức năng**         |   **Quyền cần**   |
|:----------------------:|:-----------------------------:|:-----------------:|
| /set-channel <channel> | Cài đặt kênh chơi nối từ      | `MANAGE_GUILD`    |
| /help                  | Xem thông tin và các lệnh BOT |                   |
| !start                 | Bắt đầu lượt chơi nối từ      |                   |
| !stop                  | Kết thúc lượt chơi nối từ     | `MANAGE_CHANNEL`  |
| /stats                 | Xem thống kê của Bot          |                   |
| /rank                  | Xem BXH nối từ trong máy chủ  |                   |
| /me                    | Xem thống kê nối từ cá nhân   |                   |
| /server                | Xem thông tin máy chủ         |                   |
| /report <từ> [lí do]   | Báo cáo từ không phù hợp      | `MANAGE_GUILD`    |

