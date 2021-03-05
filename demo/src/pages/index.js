import React from 'react';
import { Box, Button, Col, Heading, Image, Row } from '@fast-ai/ui-components';
import { FormattedMessage, Link, Page, Seo } from 'gatsby-theme-fast-ai';

import m from '../intl/messages';
import logoSrc from '../../content/assets/zoe-ai-logo.svg';

const Logo = (props) => (
	<Image
		height={[150, 150, 180]}
		title="Zoe.ai - Behavioral Scoring"
		alt="Zoe.ai logo"
		src={logoSrc}
		{...props}
	/>
);
// eslint-disable-next-line react/prop-types
const Section = ({ children, sx, ...rest }) => (
	<Row sx={{ position: 'relative', zIndex: 1, ...sx }} {...rest}>
		<Col span={[12, 12, 12, 9]} mx="auto">
			{children}
		</Col>
	</Row>
);

const Index = () => (
	<Page>
		<Seo title="Home" />
		<Section mb={5}>
			<Box sx={{ textAlign: 'center' }}>
				<Logo />

				<Heading variant="subHeading1">
					<FormattedMessage {...m.pageHomeTitle} />
				</Heading>

				<Box sx={{ fontSize: [4, 5, 6] }}>
					<FormattedMessage {...m.pageHomeDescription} />
				</Box>
				<Box pb={3} />

				<Button as={Link} variant="primary" to="/loans">
					<FormattedMessage {...m.pageHomeActionLabel} />
				</Button>
			</Box>
		</Section>
	</Page>
);

export default Index;
