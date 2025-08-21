# PDF Merger [By Prodi]

A simple web application for merging multiple PDF files into a single document, built with a modern frontend stack.

## Architecture

This project is a single-page application built with:

- **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## Local Development

To run the application on your local machine, you'll need [Bun](https://bun.sh/) installed. Bun is used by lovable. 

1.  **Clone the repository:**
    ```sh
    git clone <YOUR_GIT_URL>
    cd pdf-merger
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Run the development server:**
    ```sh
    bun run dev
    ```

## Running with Docker

The application is containerized for easy deployment and consistent environments.

1.  **Build the Docker image:**
    ```sh
    docker build -t pdf-merger .
    ```

2.  **Run the container:**
    ```sh
    docker run -d -p 8080:8080 --name pdf-merger-app pdf-merger
    ```
    The application will be accessible at `http://localhost:8080`. This is the recommended method for deployment on platforms like Google Cloud Run.
