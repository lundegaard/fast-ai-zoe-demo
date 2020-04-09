import React, { Fragment, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
	Button,
	Col,
	Flex,
	Heading,
	Link,
	Radio,
	Row,
	Text,
	useDebounce,
	useIdleTime,
	useModal,
} from '@fast-ai/ui-components';
import { useInterval } from '@restart/hooks';
import { FormattedMessage, useIntl } from 'gatsby-theme-fast-ai';
import createRandomString from 'crypto-random-string';
import { hasLengthInInterval, hasOnlyDigits, isRequired } from 'validarium';

import { fetchFeatures, logFeatures } from '../predictions';
import m from '../intl/messages';
import { AmountFormatter, DurationFormatter } from '../formatters';
import {
	CheckboxField,
	NumberTextField,
	RadioGroupField,
	SelectField,
	SliderField,
	TextField,
	useDevConsole,
	useForm,
} from '../components';
import { CoborrowerChoice, MaritalStatus, getEducationByLanguage } from '../lookups';

import PredictionsModal, {
	ClosingReasons as PredictionsModalClosingReasons,
} from './PredictionsModal';

const FormHeading = (props) => <Heading as="h2" mt={0} mb={4} {...props} />;
const HalfCol = (props) => <Col span={[12, 12, 6]} mb={4} {...props} />;
const FullCol = (props) => <Col span={12} mb={4} {...props} />;

const isBirthNumber = hasLengthInInterval(9, 10);

const PersonalInfo = ({ fieldPrefix }) => {
	const intl = useIntl();
	const Education = useMemo(() => getEducationByLanguage(intl.locale), [intl.locale]);

	return (
		<Fragment>
			<HalfCol>
				<TextField
					validate={isRequired}
					label={<FormattedMessage {...m.givenName} />}
					field={`${fieldPrefix}.givenName`}
				/>
			</HalfCol>

			<HalfCol>
				<TextField
					validate={isRequired}
					label={<FormattedMessage {...m.familyName} />}
					field={`${fieldPrefix}.familyName`}
				/>
			</HalfCol>

			<HalfCol>
				<TextField
					label={<FormattedMessage {...m.birthNumber} />}
					field={`${fieldPrefix}.birthNumber`}
					validate={isBirthNumber}
				/>
			</HalfCol>

			<HalfCol>
				<TextField
					label={<FormattedMessage {...m.streetAddress} />}
					field={`${fieldPrefix}.address.streetAddress`}
				/>
			</HalfCol>

			<HalfCol>
				<TextField
					label={<FormattedMessage {...m.streetLocality} />}
					field={`${fieldPrefix}.address.streetLocality`}
				/>
			</HalfCol>

			<HalfCol>
				<TextField
					label={<FormattedMessage {...m.postalCode} />}
					field={`${fieldPrefix}.address.postalCode`}
				/>
			</HalfCol>

			<HalfCol>
				<TextField
					label={<FormattedMessage {...m.phoneNumber} />}
					field={`${fieldPrefix}.phoneNumber`}
				/>
			</HalfCol>

			<HalfCol>
				<TextField label={<FormattedMessage {...m.email} />} field={`${fieldPrefix}.email`} />
			</HalfCol>

			<HalfCol>
				<SelectField
					label={<FormattedMessage {...m.maritalStatus} />}
					field={`${fieldPrefix}.maritalStatus`}
					items={['', ...MaritalStatus.values].map((status) => ({
						value: status,
						label: status ? intl.formatMessage(m[`maritalStatus_${status}`]) : status,
					}))}
				/>
			</HalfCol>

			<HalfCol>
				<SelectField
					label={<FormattedMessage {...m.education} />}
					field={`${fieldPrefix}.education`}
					items={['', ...Education.values].map((level) => ({
						value: level,
						label: level ? intl.formatMessage(m[`${Education.name}_${level}`]) : level,
					}))}
				/>
			</HalfCol>

			<HalfCol>
				<NumberTextField
					label={<FormattedMessage {...m.netIncomeMain} />}
					field={`${fieldPrefix}.balance.netIncomeMain`}
					validate={hasOnlyDigits}
				/>
			</HalfCol>

			<HalfCol>
				<NumberTextField
					label={<FormattedMessage {...m.expenditureAnotherInstallment} />}
					field={`${fieldPrefix}.balance.expenditureAnotherInstallment`}
					validate={hasOnlyDigits}
				/>
			</HalfCol>
		</Fragment>
	);
};
PersonalInfo.propTypes = { fieldPrefix: PropTypes.string };

const LoanInfo = ({ monthlyFee }) => (
	<Fragment>
		<FullCol>
			<SliderField
				label={<FormattedMessage {...m.loanInfoAmount} />}
				field="loanInfo.amount"
				renderValue={AmountFormatter}
				min={0}
				max={10000000}
				step={1}
			/>
		</FullCol>
		<FullCol>
			<SliderField
				label={<FormattedMessage {...m.numberOfInstalments} />}
				field="loanInfo.numberOfInstalments"
				renderValue={DurationFormatter}
				min={1}
				max={360}
				step={1}
			/>
		</FullCol>

		<FullCol>
			<RadioGroupField
				legend={<FormattedMessage {...m.coborrowerChoice} />}
				field="webdata.coborrowerChoice"
			>
				{CoborrowerChoice.values.map((value) => (
					<Radio
						key={value}
						value={value}
						label={<FormattedMessage {...m[`${CoborrowerChoice.name}_${value}`]} />}
					/>
				))}
			</RadioGroupField>
		</FullCol>

		<FullCol>
			<Flex justifyContent="space-between" alignItems="center">
				<Heading as="div" mb={0} mt={0}>
					<FormattedMessage {...m.totalAmountPerMonth} />
				</Heading>
				<Heading as="h2" mb={0} mt={0}>
					<AmountFormatter>{monthlyFee}</AmountFormatter>
				</Heading>
			</Flex>
		</FullCol>

		<FullCol>
			<CheckboxField
				label={
					<Text fontSize={[1, 1, 1, 2]} p={0} m={0}>
						<FormattedMessage
							{...m.terms}
							values={{
								// eslint-disable-next-line react/display-name
								a: (...children) => <Link href="#" children={children} />,
							}}
						/>
					</Text>
				}
				field="terms"
			/>
		</FullCol>
	</Fragment>
);

LoanInfo.propTypes = {
	monthlyFee: PropTypes.node,
};
const borrower = {
	givenName: '',
	familyName: '',
	education: '',
	maritalStatus: '',
	birthNumber: '',
	email: '',
	phoneNumber: '',
	balance: {
		netIncomeMain: '',
		expenditureAnotherInstallment: '',
	},
	address: {
		streetAddress: '',
		streetLocality: '',
		postalCode: '',
	},
};

const defaultValues = {
	webdata: { coborrowerChoice: 'SINGLE' },
	loanInfo: {
		numberOfInstalments: 12,
		amount: 100000,
	},
	borrower,
	coborrower: borrower,
};

const getApplicationId = () =>
	`demo-${createRandomString({ length: 10, type: 'distinguishable' })}`;

const DemoForm = ({ loggingInterval = 5000 }) => {
	const { openModal } = useModal({ component: PredictionsModal });
	const [applicationId, setApplicationId] = useState(getApplicationId());

	const {
		Form,
		meta: { isTouched, isSubmitting, canSubmit },
		getFieldValue,
		attemptSubmit: handleClickSubmit,
		send,
		register,
		reset,
		values,
	} = useForm({
		defaultValues,
		name: 'zoeDemo',
		onSubmit: async (values) => {
			send(values);

			openModal({
				applicationId,
				onClose: ({ reason }) => {
					if (reason === PredictionsModalClosingReasons.CLICK_ON_TRY_AGAIN) {
						reset();
						setApplicationId(getApplicationId());
					}
				},
			});
		},
	});

	const { log } = useDevConsole();

	useEffect(() => {
		register(applicationId);
	}, [register, applicationId]);

	const { isIdle } = useIdleTime();

	useInterval(
		() => {
			log({ 'Application ID': applicationId, 'Tenant ID': process.env.TENANT_ID });

			if (isTouched && !document.hidden && !isIdle) {
				send(values, true);

				fetchFeatures(applicationId).then((features) => void log(logFeatures(features)));
			}
		},
		loggingInterval,
		false, // is paused
		true // run immediately
	);

	const monthlyFee =
		getFieldValue('loanInfo.amount') / getFieldValue('loanInfo.numberOfInstalments');
	const [monthlyFeeDebounced] = useDebounce(monthlyFee, 200);

	return (
		<Form>
			<Row flexWrap="wrap">
				<Col span={[12, 12, 6]}>
					<Row flexWrap="wrap">
						<FullCol>
							<FormHeading>
								<FormattedMessage {...m.personalInfoTitle} />
							</FormHeading>
						</FullCol>

						<PersonalInfo fieldPrefix="borrower" />
					</Row>
				</Col>
				<Col span={[12, 12, 6]}>
					<Row flexWrap="wrap">
						<FullCol>
							<FormHeading>
								<FormattedMessage {...m.setupLoanTitle} />
							</FormHeading>
						</FullCol>

						<LoanInfo monthlyFee={monthlyFeeDebounced} />

						<FullCol>
							<Button
								onClick={handleClickSubmit}
								variant="secondary"
								width={1}
								disabled={!canSubmit || isSubmitting}
							>
								<FormattedMessage {...m.apply} />
							</Button>
						</FullCol>
					</Row>
				</Col>
			</Row>
		</Form>
	);
};

DemoForm.propTypes = { loggingInterval: PropTypes.number };

export default DemoForm;
