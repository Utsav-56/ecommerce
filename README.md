The payment integration of the main app, `@/BhokLagyo/` is failing and is not properly made and integrated, there is a reference code in `@/ecommerce/` which is a more complete version of the payment integration,

The code in `@/ecommerce/` does work in terms of payment methods and the additional admin security, but the ui and the whole app is different, so we have to address the issues in the current code and take the look at the code in the reference at, `@/ecommerce/` and then change in our main code, `@/BhokLagyo/`

## Current incompleteness in the `@/BhokLagyo/`

1. there is a dummy button in the checkout page. it does not do anything, just says a fake order recieved, but this is not a ideal thing, instead of that we need to implement the integration of actual payment methods ssandbox mode,

## Payment methods needed

we dont need all methods of the world, we just need esewa and khalti,
and such a way that just changing the env variable will make it activate the real transaction,

needs are:

- Esewa and khalti to be only payment methods,
- they must work as real methods not some dummy methods,
- There must be a proper webhook method in the server side which will confirm the order after the payment is done,
- There must be a proper webhook stored in the database for the history reference,

Refer to the real esewa and khalti documentation to implement it properly.

> Esewa: `https://developer.esewa.com.np/pages/Token#overview`
> khalti: `https://docs.khalti.com/khalti-epayment/`

They must operate in sandbox or test mode for now, later we can switch to real mode.

## The other problems in the code

these are not the only problems that exist in the codebase, there is also follwoing problems,

### Issue 1

- There is no dark mode supprot for the app
- there is hard coded colors in many places of app, e.g `bg-red` or `text-white`
- The app must be config driven, meaning modifying the theme color in one place i.e tailind.config.js or .env will change the color of the whole app.
- There must not be any `as` or `bs` or `cs` etc. any where in the code, it should be `primary` or `secondary` or `accent` etc. which can be changed in the config.
- Not just colors other configs should alsp be config driven, like font size etc

#### To do

- First deeply audit the codebase and find where are there hardcoded colors or any css configs
- think of how they can be replaced with config driven values
- Look for the payment integration places,
- Remove the dummy button from the checkout page, and implemnt the real payment methods
- Check the backend side webhook integration, make it better and add proper error handling
- The payment method must be production level ready.

for the integration of the payment and how payment flows do refer `@/ecommerce/payment-integration.md` and the proper code base to get the context.

