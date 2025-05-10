# Peer Tutoring System

This project aims to be a leading national platform connecting university students with high-quality, reliable peer tutors. Our mission is to empower students with accessible, affordable, and secure tutoring solutions. We address several key problems: parents struggling to find certified tutors due to limited local options; unreliable online platforms where tutors may cancel frequently or lack expertise; high tutoring fees in urban areas making one-on-one lessons inaccessible; and the lack of a centralized platform, forcing students and parents to juggle multiple websites and apps to locate, schedule, and review tutors.

## Prerequisites

Before you begin, ensure you have the following installed:

* [Node.js](https://nodejs.org/) (which includes npm)

## Installation

1. Clone the repository (if you haven't already):

    ```bash
    git clone https://github.com/UpperMoon0/PeerTutoringSystem-FE.git
    ```

2. Navigate to the project directory:

    ```bash
    cd PeerTutoringSystem-FE
    ```

3. Install the dependencies:

    ```bash
    npm install
    ```

## Environment Variables

The application requires certain environment variables to be set up for Firebase integration and backend communication.

1. Create a `.env` file in the root of the `PeerTutoringSystem-FE` directory by copying the template:

    ```bash
    cp .env.template .env
    ```
  
2. Open the `.env` file and update the following variables with your specific configuration:

    ```env
    VITE_FIREBASE_API_KEY="YOUR_API_KEY"
    VITE_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
    VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
    VITE_API_BASE_URL="YOUR_BACKEND_BASE_URL (e.g. https://localhost:7258/api)"
    ```

    * `VITE_FIREBASE_API_KEY`: Your Firebase project's API Key.
    * `VITE_FIREBASE_AUTH_DOMAIN`: Your Firebase project's Auth Domain.
    * `VITE_FIREBASE_PROJECT_ID`: Your Firebase project's Project ID.
    * `VITE_API_BASE_URL`: The base URL for your backend API.

## Running the Development Server

To start the development server, run the following command:

```bash
npm run dev
```

This will typically start the server on `http://localhost:5173` (or another port if 5173 is in use).
