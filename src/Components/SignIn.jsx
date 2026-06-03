import { useState } from 'react'
import { useAuth } from '../Context/useAuth'
import { SignUp } from './SignUp'
import logo from '../assets/Images/logo.png'
import background from '../assets/Images/bg.png'

export const SignIn = () => {

    const { handleSignIn, handleSignUp } = useAuth();
    const [formView, setFormView] = useState("signin");
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [signInData, setSignInData] = useState({
        username: '',
        password: ''
    });

    const [signUpData, setSignUpData] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        phone: ''
    });

    const submitSignIn = async (e) => {
        e.preventDefault();

        setErrorMessage('');
        setSuccessMessage('');

        const success = await handleSignIn(
            signInData.username,
            signInData.password
        );

        if (success) {
            setSuccessMessage('Login successful!');
        } else {
            setErrorMessage('Invalid username or password.');
        }
    };

    const submitSignUp = async (e) => {
        e.preventDefault();

        setErrorMessage('');
        setSuccessMessage('');

        if (signUpData.password !== signUpData.confirmPassword) {
            setErrorMessage("Passwords do not match!");
            return;
        }


        if (!signUpData.confirmPassword) {
            setErrorMessage("Please confirm your password.");
            return;
        }

        const success = await handleSignUp(signUpData);

        if (success) {
            setSuccessMessage('Registration successful!');
            setFormView("signin");

            setSignUpData({
                name: '',
                email: '',
                username: '',
                password: '',
                phone: ''
            });

        } else {
            setErrorMessage('Email is already registered.');
        }
    };

    return (
        <>

            <title>Sign In</title>

            <div
                className="min-h-screen w-full flex items-center justify-center bg-cover bg-center p-4 md:p-8"
                style={{ backgroundImage: `url(${background})` }}
            >

                {formView === "signin" && (
                    <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-8 md:gap-12 w-full max-w-4xl">
                        <div className="w-full max-w-xs">
                            <form onSubmit={submitSignIn}>
                                <div className="flex flex-col justify-center w-full">
                                    <div className="flex justify-center">
                                        <img
                                            src={logo}
                                            className="rounded-full w-32 h-32 md:w-42 md:h-42 mb-6 object-cover"
                                            alt="logo"
                                        />
                                    </div>

                                    <label className="text-white mb-1 text-sm">
                                        Enter your Username
                                    </label>

                                    <input
                                        type="text"
                                        value={signInData.username}
                                        onChange={(e) =>
                                            setSignInData({
                                                ...signInData,
                                                username: e.target.value
                                            })
                                        }
                                        className="bg-white p-3 px-4 rounded-lg w-full text-black mb-4 outline-none shadow-md"
                                        placeholder="Username"
                                    />

                                    <label className="text-white mb-1 text-sm">
                                        Enter your Password
                                    </label>

                                    <input
                                        type="password"
                                        value={signInData.password}
                                        maxLength={12}
                                        onChange={(e) =>
                                            setSignInData({
                                                ...signInData,
                                                password: e.target.value
                                            })
                                        }
                                        className="bg-white p-3 px-4 rounded-lg w-full text-black outline-none shadow-md"
                                        placeholder="Password"
                                    />

                                    {errorMessage && (
                                        <div className="bg-red-500/20 border border-red-400 text-red-200 text-sm p-3 rounded-md mt-4">
                                            {errorMessage}
                                        </div>
                                    )}

                                    {successMessage && (
                                        <div className="bg-green-500/20 border border-green-400 text-green-200 text-sm p-3 rounded-md mt-4">
                                            {successMessage}
                                        </div>
                                    )}

                                    <div className="flex flex-row pt-4 gap-2">

                                        <button
                                            type="submit"
                                            className="bg-[#8f703a] w-full cursor-pointer transition duration-200 rounded-sm p-3 text-white"
                                        >
                                            Sign In
                                        </button>

                                        <button
                                            type="button"
                                            className="bg-[#624d2d] w-full cursor-pointer transition duration-200 rounded-sm p-3 text-white"
                                            onClick={() => {
                                                setFormView("signup");
                                                setErrorMessage('');
                                                setSuccessMessage('');
                                            }}
                                        >
                                            Sign Up
                                        </button>

                                    </div>

                                </div>

                            </form>

                        </div>

                        <h2
                            className="text-white text-center text-4xl md:text-5xl tracking-[-0.03em] drop-shadow-lg leading-tight font-vibes max-w-md"
                            style={{
                                textShadow: '2px 2px 4px rgba(0,0,0,0.6)',
                                fontFamily: "cursive"
                            }}
                        >
                            Every bean has a journey, and
                            <br className="hidden md:block" />
                            every cup tells a story.
                        </h2>

                    </div>
                )}

                {formView === "signup" && (
                    <SignUp
                        signUpData={signUpData}
                        setSignUpData={setSignUpData}
                        submitSignUp={submitSignUp}
                        setFormView={setFormView}
                        errorMessage={errorMessage}
                        successMessage={successMessage}
                        setErrorMessage={setErrorMessage}
                        setSuccessMessage={setSuccessMessage} />
                )}
            </div>
        </>
    )
}