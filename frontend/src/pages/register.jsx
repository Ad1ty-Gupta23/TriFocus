import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Register() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "Volunteer",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const validateForm = () => {
    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (values.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(values.email)) {
      setError("Please provide a valid email address");
      return false;
    }

    if (values.username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...userData } = values;
      
      const res = await axios.post(
        "http://localhost:5000/api/user/register",
        userData
      );

      if (res.status === 201) {
        toast.success("Registration successful! Please login.");
        navigate("/login");
      } else {
        setError(res.data.message || "Registration failed. Please try again.");
        toast.error(res.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <BackgroundEffects>
        <FloatingOrb className="orb-1" />
        <FloatingOrb className="orb-2" />
        <FloatingOrb className="orb-3" />
        <FloatingOrb className="orb-4" />
      </BackgroundEffects>
      
      <ContentWrapper>
        <WelcomeSection>
          <WelcomeContent>
            <WelcomeTitle>
              Start Your
              <GradientText> Journey</GradientText>
            </WelcomeTitle>
            <WelcomeDescription>
              Join thousands of users who have transformed their productivity and well-being with TriFocus
            </WelcomeDescription>
            <BenefitsList>
              <Benefit>
                <BenefitIcon>🚀</BenefitIcon>
                <BenefitText>Boost Productivity by 300%</BenefitText>
              </Benefit>
              <Benefit>
                <BenefitIcon>🧠</BenefitIcon>
                <BenefitText>Improve Mental Clarity</BenefitText>
              </Benefit>
              <Benefit>
                <BenefitIcon>⏰</BenefitIcon>
                <BenefitText>Master Time Management</BenefitText>
              </Benefit>
              <Benefit>
                <BenefitIcon>🎯</BenefitIcon>
                <BenefitText>Achieve Your Goals</BenefitText>
              </Benefit>
            </BenefitsList>
          </WelcomeContent>
        </WelcomeSection>
        
        <FormCard>
          <LogoSection>
            <LogoIcon>✦</LogoIcon>
            <BrandName>TriFocus</BrandName>
            <Subtitle>Create your account</Subtitle>
          </LogoSection>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <Form onSubmit={handleSubmit}>
            <InputRow>
              <InputGroup>
                <InputWrapper>
                  <UserIcon>👤</UserIcon>
                  <StyledInput
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={values.username}
                    onChange={handleChange}
                    required
                  />
                </InputWrapper>
              </InputGroup>
              
              <InputGroup>
                <InputWrapper>
                  <EmailIcon>📧</EmailIcon>
                  <StyledInput
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={values.email}
                    onChange={handleChange}
                    required
                  />
                </InputWrapper>
              </InputGroup>
            </InputRow>
            
            <InputRow>
              <InputGroup>
                <InputWrapper>
                  <LockIcon>🔒</LockIcon>
                  <StyledInput
                    type="password"
                    name="password"
                    placeholder="Password (8+ chars)"
                    value={values.password}
                    onChange={handleChange}
                    required
                  />
                </InputWrapper>
              </InputGroup>
              
              <InputGroup>
                <InputWrapper>
                  <CheckIcon>✓</CheckIcon>
                  <StyledInput
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </InputWrapper>
              </InputGroup>
            </InputRow>
            
            <InputGroup>
              <SelectWrapper>
                <RoleIcon>🏷️</RoleIcon>
                <StyledSelect
                  name="userType"
                  value={values.userType}
                  onChange={handleChange}
                  required
                >
                  <option value="Volunteer">🤝 Volunteer</option>
                  <option value="Therapist">👨‍⚕️ Therapist</option>
                </StyledSelect>
              </SelectWrapper>
            </InputGroup>
            
            <RegisterButton type="submit" disabled={isLoading}>
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowIcon>→</ArrowIcon>
                </>
              )}
            </RegisterButton>
          </Form>
          
          <Divider>
            <DividerLine />
            <DividerText>or</DividerText>
            <DividerLine />
          </Divider>
          
          <LoginSection>
            <LoginText>Already have an account?</LoginText>
            <LoginLink to="/login">Sign in instead</LoginLink>
          </LoginSection>
        </FormCard>
      </ContentWrapper>
    </Container>
  );
}

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #be185d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
  overflow: hidden;
`;

const BackgroundEffects = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`;

const FloatingOrb = styled.div`
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3));
  animation: ${float} 6s ease-in-out infinite, ${pulse} 4s ease-in-out infinite;
  
  &.orb-1 {
    width: 180px;
    height: 180px;
    top: 5%;
    left: 5%;
    animation-delay: 0s;
  }
  
  &.orb-2 {
    width: 120px;
    height: 120px;
    top: 20%;
    right: 10%;
    animation-delay: 2s;
  }
  
  &.orb-3 {
    width: 200px;
    height: 200px;
    bottom: 10%;
    left: 15%;
    animation-delay: 4s;
  }
  
  &.orb-4 {
    width: 140px;
    height: 140px;
    bottom: 30%;
    right: 5%;
    animation-delay: 6s;
  }
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1400px;
  width: 100%;
  align-items: center;
  position: relative;
  z-index: 1;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
`;

const WelcomeSection = styled.div`
  animation: ${slideIn} 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 1024px) {
    order: 1;
  }
`;

const WelcomeContent = styled.div`
  color: white;
  max-width: 600px;
`;

const WelcomeTitle = styled.h1`
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 2.8rem;
  }
`;

const GradientText = styled.span`
  background: linear-gradient(45deg, #8b5cf6, #ec4899, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const WelcomeDescription = styled.p`
  font-size: 1.3rem;
  color: rgba(248, 250, 252, 0.8);
  line-height: 1.6;
  margin-bottom: 3rem;
`;

const BenefitsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Benefit = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${fadeInUp} 0.6s ease-out;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  &:nth-child(4) { animation-delay: 0.4s; }
`;

const BenefitIcon = styled.span`
  font-size: 2rem;
  min-width: 3rem;
`;

const BenefitText = styled.span`
  font-weight: 600;
  color: rgba(248, 250, 252, 0.9);
  font-size: 1.1rem;
`;

const FormCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  animation: ${slideInRight} 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 1024px) {
    order: 2;
  }
  
  @media (max-width: 768px) {
    padding: 2rem;
    margin: 1rem;
  }
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const LogoIcon = styled.div`
  font-size: 3rem;
  color: #f8fafc;
  margin-bottom: 1rem;
  display: inline-block;
  background: linear-gradient(45deg, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const BrandName = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #f8fafc, #e2e8f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: rgba(248, 250, 252, 0.7);
  font-size: 1.1rem;
  margin: 0;
`;

const Form = styled.form`
  width: 100%;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
  
  ${InputRow} & {
    margin-bottom: 0;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SelectWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const UserIcon = styled.span`
  position: absolute;
  left: 1rem;
  font-size: 1.2rem;
  z-index: 1;
  color: rgba(248, 250, 252, 0.6);
`;

const EmailIcon = styled.span`
  position: absolute;
  left: 1rem;
  font-size: 1.2rem;
  z-index: 1;
  color: rgba(248, 250, 252, 0.6);
`;

const LockIcon = styled.span`
  position: absolute;
  left: 1rem;
  font-size: 1.2rem;
  z-index: 1;
  color: rgba(248, 250, 252, 0.6);
`;

const CheckIcon = styled.span`
  position: absolute;
  left: 1rem;
  font-size: 1.2rem;
  z-index: 1;
  color: rgba(248, 250, 252, 0.6);
`;

const RoleIcon = styled.span`
  position: absolute;
  left: 1rem;
  font-size: 1.2rem;
  z-index: 1;
  color: rgba(248, 250, 252, 0.6);
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #f8fafc;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  
  &::placeholder {
    color: rgba(248, 250, 252, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
    transform: translateY(-2px);
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #f8fafc;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='rgba(248, 250, 252, 0.6)' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 12px;
  
  option {
    background: #1e1b4b;
    color: #f8fafc;
    padding: 0.5rem;
  }
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    background-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
    transform: translateY(-2px);
  }
`;

const RegisterButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(45deg, #8b5cf6, #ec4899);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  
  &:hover {
    background: linear-gradient(45deg, #7c3aed, #db2777);
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const ArrowIcon = styled.span`
  font-size: 1.2rem;
  transition: transform 0.3s ease;
  
  ${RegisterButton}:hover & {
    transform: translateX(4px);
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const ErrorMessage = styled.div`
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
  backdrop-filter: blur(10px);
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 2rem 0;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
`;

const DividerText = styled.span`
  color: rgba(248, 250, 252, 0.6);
  padding: 0 1rem;
  font-size: 0.9rem;
`;

const LoginSection = styled.div`
  text-align: center;
`;

const LoginText = styled.p`
  color: rgba(248, 250, 252, 0.7);
  margin: 0 0 0.5rem 0;
`;

const LoginLink = styled(Link)`
  color: #8b5cf6;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
  
  &:hover {
    color: #a855f7;
    text-decoration: underline;
  }
`;

export default Register;