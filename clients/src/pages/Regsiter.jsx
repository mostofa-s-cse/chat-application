import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useEffect } from 'react'
import { googleAuth, registerUser } from '../apis/auth'
import { useState } from 'react'
import { BsEmojiLaughing, BsEmojiExpressionless } from "react-icons/bs"
import { toast } from 'react-toastify';
import { validUser } from '../apis/auth'

const defaultData = {
  firstName: "",
  lastName: "",
  email: "",
  password: ""
}

function Register() {
  const [formData, setFormData] = useState(defaultData)
  const [isLoading, setIsLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const pageRoute = useNavigate()

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setIsLoading(true)
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` },
        }).then(res => res.json());

        const googleResponse = await googleAuth({ tokenId: response.access_token })
        if (googleResponse.data.token) {
          localStorage.setItem("userToken", googleResponse.data.token)
          pageRoute("/chats")
        }
      } catch (error) {
        toast.error("Something went wrong. Try again!")
      } finally {
        setIsLoading(false)
      }
    },
    onError: () => {
      toast.error("Google login failed. Try again!")
    }
  });

  const handleOnChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const formSubmit = async (e) => {
    e.preventDefault()
    if (formData.email.includes("@") && formData.password.length > 6) {
      setIsLoading(true)
      const { data } = await registerUser(formData)
      if (data?.token) {
        localStorage.setItem("userToken", data.token)
        toast.success("Successfully Registered!")
        setIsLoading(false)
        pageRoute("/chats")
      }
      else {
        setIsLoading(false)
        toast.error("Registration Failed!")
        setFormData({ ...formData, password: "" })
      }
    }
    else {
      setIsLoading(false)
      toast.warning("Provide valid Credentials!")
      setFormData(defaultData)
    }
  }

  useEffect(() => {
    const isValid = async () => {
      const data = await validUser()
      if (data?.user) {
        window.location.href = "/chats"
      }
    }
    isValid()
  }, [])

  return (
    <>
      <div className='bg-[#121418] w-[100vw] h-[100vh] flex justify-center items-center'>
        <div className='w-[90%] sm:w-[400px] pl-0 ml-0 h-[400px] sm:pl-0 sm:ml-9 mt-20 relative'>
          <div className='absolute -top-5 left-0'>
            <h3 className=' text-[25px] font-bold tracking-wider text-[#fff]'>Register</h3>
            <p className='text-[#fff] text-[12px] tracking-wider font-medium'>Already have an Account ? <Link className='text-[rgba(0,195,154,1)] underline' to="/login">Login</Link></p>
          </div>
          <form className='flex flex-col gap-y-3 mt-[12%]' onSubmit={formSubmit}>
            <div className='flex gap-x-2'>
              <input className="w-[100%] sm:w-[38%] bg-[#222222] h-[50px] pl-3 text-[#ffff]" onChange={handleOnChange} name="firstName" type="text" placeholder='First Name' value={formData.firstName} required />
              <input className="w-[100%] sm:w-[38%] bg-[#222222] h-[50px] pl-3 text-[#ffff]" onChange={handleOnChange} name="lastName" type="text" placeholder='Last Name' value={formData.lastName} required />
            </div>
            <div>
              <input className="w-[100%] sm:w-[80%] bg-[#222222] h-[50px] pl-3 text-[#ffff]" onChange={handleOnChange} name="email" type="text" placeholder='Email' value={formData.email} required />
            </div>
            <div className='relative'>
              <input className='w-[100%] sm:w-[80%] bg-[#222222] h-[50px] pl-3 text-[#ffff]' onChange={handleOnChange} type={showPass ? "text" : "password"} name="password" placeholder='Password' value={formData.password} required />
              {
                !showPass ? <button type='button'><BsEmojiLaughing onClick={() => setShowPass(!showPass)} className='text-[#fff] absolute top-3 right-5 sm:right-24 w-[30px] h-[25px]' /></button> : <button type='button'> <BsEmojiExpressionless onClick={() => setShowPass(!showPass)} className='text-[#fff] absolute top-3 right-5 sm:right-24 w-[30px] h-[25px]' /></button>
              }
            </div>

            <button style={{ background: "linear-gradient(90deg, rgba(0,195,154,1) 0%, rgba(224,205,115,1) 100%)" }} className='w-[100%]  sm:w-[80%] h-[50px] font-bold text-[#121418] tracking-wide text-[17px] relative' type='submit'>
              <div style={{ display: isLoading ? "" : "none" }} className='absolute -top-[53px] left-[27%] sm:-top-[53px] sm:left-[56px]'>
                <lottie-player src="https://assets2.lottiefiles.com/packages/lf20_h9kds1my.json" background="transparent" speed="1" style={{ width: "200px", height: "160px" }} loop autoplay></lottie-player>
              </div>
              <p style={{ display: isLoading ? "none" : "block" }} className='test-[#fff]'>Register</p>
            </button>
            <p className='text-[#fff] text-center sm:-ml-20'>/</p>
            <button 
              onClick={() => googleLogin()}
              style={{ borderImage: "linear-gradient(to right, rgba(0,195,154,1) 50%, rgba(224,205,115,1) 80%)", borderImageSlice: "1" }}
              className="focus:ring-2 focus:ring-offset-1 py-3.5 px-4 border rounded-lg flex items-center w-[100%] sm:w-[80%]"
              disabled={isLoading}
            >
              <img src="https://tuk-cdn.s3.amazonaws.com/can-uploader/sign_in-svg2.svg" alt="google" />
              <p className="text-[base] font-medium ml-4 text-[#fff]">Continue with Google</p>
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default Register