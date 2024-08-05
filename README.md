# Pantry Tracker Application

This application helps users manage their pantry items efficiently, allowing them to add, edit, delete, and search for items. The application uses Firebase for backend services, React for the frontend, and Next.js for server-side rendering and static site generation.

## Features

- **User Authentication**: Secure sign-in and sign-up functionality.
- **Pantry Management**: Add, edit, delete, and search for pantry items.
- **User Data Isolation**: Each user's data is isolated to ensure privacy.
- **Responsive UI**: Modern, user-friendly interface built with Material UI.
- **Theme Toggle**: Switch between light and dark themes.
- **Profile Management**: View and update user profile information.

## Technologies Used

- **Frontend**: React, Next.js
- **Backend**: Firebase (Authentication, Firestore Database)
- **UI Framework**: Material UI
- **Styling**: SCSS/CSS Modules
- **Deployment**: Vercel (for Next.js deployment)

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/code-infected/ThePantry-V1.git
   cd pantry-tracker
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up Firebase:

   - Create a Firebase project in the Firebase Console.
   - Add a web app to the Firebase project and copy the Firebase configuration.
   - Create a `.env.local` file in the root of your project and add the Firebase configuration:

     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
     NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
     ```

4. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Navigate to `http://localhost:3000` to view the application in your browser.

## Usage

- **Sign Up / Log In**: Use the authentication features to create an account or log in.
- **Manage Pantry Items**: Use the dashboard to add, edit, and delete pantry items.
- **Profile Management**: Access and update your profile information via the profile page.
- **Theme Toggle**: Switch between light and dark themes using the theme toggle button.

## Deployment

To deploy the application, push your code to a Git repository (e.g., GitHub), and connect your repository to Vercel. Vercel will handle the build and deployment process automatically.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -am 'Add new feature'`).
4. Push the branch (`git push origin feature-branch`).
5. Create a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Firebase](https://firebase.google.com/) - For providing the backend services.
- [Material UI](https://mui.com/) - For the UI components.
- [Next.js](https://nextjs.org/) - For server-side rendering and static site generation.
