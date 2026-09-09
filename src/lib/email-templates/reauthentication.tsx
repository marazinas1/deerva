import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirm reauthentication</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can
          safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = {
  backgroundColor: '#15171B',
  fontFamily: "'Urbanist', 'Helvetica Neue', Arial, sans-serif",
  color: '#EDEAE2',
  margin: '0',
  padding: '32px 0',
}
const container = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '32px 28px',
  backgroundColor: '#15171B',
  border: '1px solid #2A2D33',
}
const h1 = {
  fontSize: '20px',
  fontWeight: 600 as const,
  letterSpacing: '-0.01em',
  color: '#EDEAE2',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: '#8B8D91',
  lineHeight: '1.6',
  margin: '0 0 24px',
}
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '24px',
  letterSpacing: '0.12em',
  fontWeight: 700 as const,
  color: '#EDEAE2',
  margin: '0 0 30px',
}
const footer = {
  fontSize: '13px',
  color: '#8B8D91',
  lineHeight: '1.6',
  margin: '28px 0 0',
  paddingTop: '20px',
  borderTop: '1px solid #2A2D33',
}
