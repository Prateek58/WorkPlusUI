import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Button,
  TextField,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';

const Help = () => {
  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'To reset your password, click on the "Forgot Password" link on the login page. You will receive an email with instructions to reset your password.',
    },
    {
      question: 'How can I update my profile information?',
      answer: 'You can update your profile information by going to the Profile page through the menu in the top-right corner. Click on your avatar to access the menu.',
    },
    {
      question: 'What should I do if I encounter an error?',
      answer: 'If you encounter an error, try refreshing the page first. If the problem persists, please contact our support team with details about the error.',
    },
    {
      question: 'How can I change the theme?',
      answer: 'You can change between light and dark theme using the theme toggle button in the top navigation bar or through the Settings page.',
    },
  ];

  return (
    <DashboardLayout>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Help & Support
      </Typography>

      <Stack spacing={3}>
        {/* Contact Support */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Contact Support
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Subject"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={4}
                variant="outlined"
              />
              <Button
                variant="contained"
                sx={{ alignSelf: 'flex-start' }}
              >
                Send Message
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Frequently Asked Questions
            </Typography>
            {faqs.map((faq, index) => (
              <Accordion key={index} sx={{ '&:not(:last-child)': { mb: 1 } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>

        {/* Support Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Additional Support
            </Typography>
            <Typography paragraph>
              If you need immediate assistance, you can reach our support team through:
            </Typography>
            <Stack spacing={1}>
              <Typography>
                • Email: support@workplus.com
              </Typography>
              <Typography>
                • Phone: +1 (555) 123-4567
              </Typography>
              <Typography>
                • Hours: Monday - Friday, 9:00 AM - 6:00 PM EST
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </DashboardLayout>
  );
};

export default Help; 