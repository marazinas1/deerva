import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Your login link for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your login link</Heading>
        <Text style={text}>
          Click the button below to log in to {siteName}. This link will expire
          shortly.
        </Text>
        <Button className="dm-btn" style={button} href={confirmationUrl}>
          Log In
        </Button>
        <Text style={footer}>
          If you didn't request this link, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

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
