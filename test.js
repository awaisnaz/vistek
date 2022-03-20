import Stripe from "stripe";
let stripe = Stripe("sk_test_51Jqd3RDg36XfZ4PUQmHwNmvavJbe4TlhaktAFbEAJUkPrcOxQxDy7SwyNaE1ubfjrEyc9XQ8BgPiYgGHcQ96zeY600pJwvegb9");

const webhookEndpoints = await stripe.webhookEndpoints.list();

console.log(webhookEndpoints);

// stripe.webhookEndpoints.del(
//   'we_1KfIwfDg36XfZ4PUTfpyzFwR'
// );

// stripe.webhookEndpoints.del(
//   'we_1KfIxsDg36XfZ4PUqCjvb49v'
// );

// stripe.webhookEndpoints.del(
//   'we_1Kac0CDg36XfZ4PU9hWKpmTU'
// );

// stripe.webhookEndpoints.del(
//   'we_1KaZtDDg36XfZ4PUQ9JJZDC7'
// );

// stripe.webhookEndpoints.del(
//   'we_1KU6WIDg36XfZ4PUplne3DDv'
// );

// stripe.webhookEndpoints.del(
//   'we_1KU4B9Dg36XfZ4PUhu12ql3p'
// );