# Installation

Use either of these commands based on the package manager you prefer.

```sh
yarn
```

```sh
npm i
```

### Running the Example

```sh
yarn start
```

```sh
npm start
```

# Libraries

Follows short commentary about 3rd party libraries we have used int the example.

#### Gatsby
The example uses Gatsby as the tool for development and bundling of the code.

#### gatsby-theme-fast-ai
Our Fast AI theme for Gatsby. It handles configuration of the Gatsby plugins and provides additional functionality such as i18n support and offline support. It also exposes handy UI layout components.

#### @fast-ai/ui-components
The library provides the React UI components created for the Fast AI platform.
They are built on the top of [Rebass](https://rebassjs.org/) and [emotion](https://emotion.sh/).

#### react-form
Super convenient (but not so performant) [library](https://github.com/tannerlinsley/react-form) that provides only React hooks for handling forms.

#### Validarium
[Validarium](https://validarium.js.org/) is agnostic validation library for JavaScript applications. We use it for field-level validations.

# Project

```
.
├── content/
│   └── assets/
├── src/
│   ├── components/
│   ├── constants/
│   ├── containers/
│   ├── gatsby-theme-fast-ai/
│   ├── intl/
│   ├── lookups/
│   ├── pages/
│   ├── plugins/
│   ├── formatters.js
│   ├── predictions.js
│   ├── sa.js
│   └── utils.js
├── static/
│   └── favicon.png
├── LICENSE
├── README.md
├── babel.config.js
├── gatsby-browser.js
├── gatsby-config.js
├── jest.config.js
├── package.json
├── testsSetup.js
└── yarn.lock
```

## S-Analytics tracking snippet

To include S-Analytics into the page we must paste the tracking snippet which loads the core of the tools and its plugins.

The snippet should be ideally added on every page into the `<head>`.

This can be easily done with Gatsby through the [`onRenderBody`](https://www.gatsbyjs.org/docs/ssr-apis/#onRenderBody).
We prepared simple Gatsby plugin to encapsulate the logic behind adding the snippet and configuration of the plugins.
See the [`./src/plugins/gatsby-plugin-s-analytics`](https://github.com/lundegaard/fast-ai-zoe-demo/blob/master/demo/src/plugins/gatsby-plugin-s-analytics).

If you don't use Gatsby you can just paste the snippet into your `html` template.

## Tracking of Page View
To track the visitor's movement around our app, we call the `pageview` event.

Again it can be done with Gatsby through the [`onRouteUpdate`](https://www.gatsbyjs.org/docs/browser-apis/#onRouteUpdate).

See the [`./gatsby-browser.js`](https://github.com/lundegaard/fast-ai-zoe-demo/blob/master/demo/gatsby.browser.js).

## Analysis of the Form Events
SA with Fast AI platform can provide, aside from the basic analysis, AI-based predictions that are revealing fraudulent behaviour in our apps.

To do that it needs to track form events in detail.
SA delivers two plugins that are focused on forms - `s-form` and `s-biometrics`.

Our example shows the way how to seamlessly bind event handlers to our form components and notify the API of SA.

### Tracking fields

We picked [react-form](https://github.com/tannerlinsley/react-form) library as the solution for handling the state and validation of the form.
In your application, you will probably use your own solution or pick another 3rd party library such as redux-form or formik.

The essence of `react-form` are the hooks `useForm` and `useField`. To create a form and custom form component:

```js
// How react-form works?
import { useForm, useField, splitFormProps } from 'react-form';

const MyInputField = (props) => {
  const [field, fieldOptions,  ...rest] = splitFormProps(props);

  const {
    value = "",
    setValue,
    meta: { error, isTouched }
  } = useField(field, fieldOptions);

  const handleChange = e => void setValue(e.target.value);

  return (
    <fieldset>
      <input {...rest} value={value} onChange={handleChange} />
      {" "}
      {isTouched && error ? <em>{error}</em> : null}
    </fieldset>
  );
}

const MyForm = () => {
  const {
    Form,
    meta: { isSubmitting, canSubmit }
  } = useForm({
    onSubmit: async (values, instance) => {
      // ...
    },
  });

  return (
    <Form>
      <MyInputField field="name" />
      // ...
    </Form>
  );
}
```

This is nice but you would need to create each wrapper that connects UI fields to react-form individually, e.g. MySelectField, MyRangeField, etc.

Majority of them would:
- handle the displaying of the validation error
- pass the value and onChange property. 

To improve that we can create HoC that would do that automatically.

```js
import { MyInputField } from 'my-favourite-ui-library';

const withReactForm = (Comp) => {
  const Field = forwardRef((props, ref) => {
    const [field, fieldOptions, rest] = splitFormProps(props);

    const {
      meta: { error, isTouched },
      getInputProps,
    } = useField(field, fieldOptions); 

    const inputProps = getInputProps({ ref, name: field, ...rest });

    const hasError = !!error && isTouched;

    return <Comp {...inputProps} hasError={hasError} hint={hasError && error} />;
  });

  return Field;
};

const ConnectedInputField = withReactForm(MyInputField);
const ConnectedSelectField = withReactForm(MySelectField);
// ...
```

Following this concept, we can easily manage common functionality of form field from one place.

We actually used this pattern in the example to create connected fields which are:

- connected to react-form
- shows the localized error messages
- connects the SA.

To connect to the SA we created the `useSAFieldTracker` hook in [`src/sa.js`](https://github.com/lundegaard/fast-ai-zoe-demo/blob/master/demo/src/sa.js). The hook wraps the handling of input events and calls appropriate methods of SA.

Usage:

```js
const MyField = props => {
  const { getInputProps } = useSAFieldTracker();

  return <input {...getInputProps(props)} />
}
```

The hook API is designed to be easily used and composable with other connections.

See:
- [`src/components/forms.js`](https://github.com/lundegaard/fast-ai-zoe-demo/blob/master/demo/src/components/forms.js) - here we generate the UI form components by the HoC that connects react-form and SA to each of the components
- [`src/containers/DemoForm.js`](https://github.com/lundegaard/fast-ai-zoe-demo/blob/master/demo/src/containers/DemoForm.js) - main form
- [`src/sa.js`](https://github.com/lundegaard/fast-ai-zoe-demo/blob/master/src/sa.js) - contains hooks to connect your form fields to SA

### Tracking of the Form lifecycle
Aside from tracking individual fields, the SA needs to track the lifecycle of the filling the form data.

The lifecycle of the form as it seen by SA:
- The application creates empty pristine form - form represents empty form data
- User fills in the form data - user fills in the individual fields and can try to submit invalid data 
- User submit valid form data

In the [`src/components/forms.js`](https://github.com/lundegaard/fast-ai-zoe-demo/blob/master/demo/src/components/forms.js) we created the `useForm` hook that extends the `useForm` from 'react-form'. The hook provides:

- automatically handles SA from events such as: s-form:submit, s-form:start, ...
- provides imperative API to call form events

Follows the simplified example of usage `useForm` from [`src/containers/DemoForm.js`](https://github.com/lundegaard/fast-ai-zoe-demo/blob/master/demo/src/containers/DemoForm.js).

```js
const {
  Form,
  attemptSubmit, // call when user tries submit data
  send, // sending the actual formdata to Zoe.AI
  register, // call when creating a new form session
  reset,
} = useForm({
  defaultValues,
  name: Forms.ZOE_DEMO, // SA needs the name of the form
  onSubmit: async (values) => {
    // Sending the final data
    send({ data: values, applicationId });

    // Reset a form and starting a new session
    reset();
  },
});

// Register new form data with unique ID. 
useEffect(() => {
  register(applicationId);
}, [applicationId]);

// Sending interim form data on every blur event
const handleFormBlur = useCallback(() => {
  if (isValid) {
    send({ data: values, inProgress: true, applicationId });
  }
}, [applicationId, values, send, isValid, statsReady]);


<Form onBlur={handleFormBlur}>
  // ...
  <Button onClick={attemptSubmit}>Submit</Button>
</Form>
```

## Polling of the Smart features

Second part of analysis is made by Zoe.AI. 
For demo purposses we continuosly pull the statistics and predictions from the `zoe.lundegaard.ai/api` based on `applicationId`.
Those data are then shown in `Console`. 
