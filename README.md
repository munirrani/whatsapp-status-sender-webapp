
# Status Sender Webapp

This is a React-based web application for sending text and media statuses to different recipient groups. It provides a simple and intuitive interface for composing and sending statuses, with features like dynamic font sizing, file attachments, and recipient selection.

## Demo

<video src="assets/Demo.mp4" controls></video>


## Features

- **Dynamic Text Area:** The text area automatically adjusts font size and alignment based on the length of the text.
- **File Attachments:** Users can attach images, videos, and audio files to their statuses.
- **Recipient Selection:** Users can select one or more recipient groups to send their statuses to.
- **Responsive Design:** The application is designed to work on both desktop and mobile devices.

## Technologies Used

- **Frontend:**
  - React
  - TypeScript
  - Vite
  - React Router
  - React Icons
  - Axios
- **Development:**
  - ESLint
  - Docker

## Getting Started

### Prerequisites

- Node.js (v22 or higher)
- npm
- Docker (optional, for containerized development)
- [https://github.com/munirrani/whatsapp-bot.git](whatsapp-bot)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/munirrani/status-sender-webapp.git
   cd status-sender-webapp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add the following environment variables:
   ```
   VITE_EXPO_PUBLIC_BAILEY_API_KEY=your_api_key
   ```

### Running the Application

**Without Docker:**

To run the application in development mode, use the following command:

```bash
npm run dev
```

This will start the Vite development server at `http://localhost:5173`.

**With Docker:**

To run the application in a Docker container, use the following command:

```bash
docker-compose up
```

This will build the Docker image and start the container. The application will be accessible at `http://localhost:5173`.

## Build for Production

To build the application for production, use the following command:

```bash
npm run build
```

This will create a `dist` directory with the production-ready files.

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run lint`: Lints the source code using ESLint.
- `npm run preview`: Starts a local server to preview the production build.

## Project Structure

```
/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── TypeStatus.tsx
│   └── vite-env.d.ts
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License.
