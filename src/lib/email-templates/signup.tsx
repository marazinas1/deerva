import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Confirm your email for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirm your email</Heading>
        <Text style={text}>
          Thanks for signing up for{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          !
        </Text>
        <Text style={text}>
          Please confirm your email address (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) by clicking the button below:
        </Text>
        <Button className="dm-btn" style={button} href={confirmationUrl}>
          Verify Email
        </Button>
        <Text style={footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

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
const link = { color: '#5C7A8A', textDecoration: 'underline' }
const button = {
  backgroundColor: '#5C7A8A',
  color: '#15171B',
  fontSize: '14px',
  fontWeight: 600 as const,
  border: '1px solid #5C7A8A',
  borderRadius: '2px',
  padding: '12px 22px',
  textDecoration: 'none',
}
const footer = {
  fontSize: '13px',
  color: '#8B8D91',
  lineHeight: '1.6',
  margin: '28px 0 0',
  paddingTop: '20px',
  borderTop: '1px solid #2A2D33',
}
// Rendered as a text child, which React may HTML-escape: keep this CSS free of >, &, and quotes.
const darkModeCss = `
  @media (prefers-color-scheme: dark) {
    .dm-btn { background-color: #5C7A8A !important; color: #15171B !important; }
  }
  [data-ogsc] .dm-btn { background-color: #5C7A8A !important; color: #15171B !important; }
  [data-ogsb] .dm-btn { background-color: #5C7A8A !important; color: #15171B !important; }
`
