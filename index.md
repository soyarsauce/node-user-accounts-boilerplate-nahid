# Class

## `Auth`

Authenticator/passport strategy wrapper abstraction. I.e. it is the parent class of all auth classes.

### `constructor(method: string, options: object)`

### `method: *`

Authentication method name. E.g. 'email' for Email based authentication. This is used as an unique id for various things.

### `description: *`

This is a standard descriptor of this authentication mechanism that is publicly shared. Clients should use this to figure out how to use a login auth from outside. Not directly configurable.

### `authenticateOptions: *`

Additional settings given to passport.authenticate. Not directly configurable.

### `users: CachedCollection`

Users collection. Note: various things all assume that a CachedCollection is being used.

### `defaultRoles: object`

Default roles new registered users should assume.

### `custom: object`

Custom fields

### `install(app: ExpressApplication, prefix: string, passport: Passport)`

Must be overridden to provide implementation of said authentication method.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| app | ExpressApplication |  | express application |
| prefix | string |  | all route prefix |
| passport | Passport |  | passport class |

### `findUser(value: string): User|false`

Helper method that finds an user based on a credential. A credential is something like an email address or a facebook user id. This is something that uniquely identifies an account.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| value | string |  |

### `handleUserLoginByProfile(username: string, profile: Profile, done: Function, req: Request)`

Helper method for SSO type logins. This method finds existing or creates new accounts basen on profile information returned from oauth partner.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| username | string |  | unique id |
| profile | Profile |  | unique id |
| done | Function |  | callback to call when our work is done |
| req | Request | optional: true | request object |

### `createUserFromProfile(profile: Profile): User`

Helper method that creates an User object from a Profile

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| profile | Profile |  |

### `createProfileFromCredential(id: *, extra: {}): *`

helper method that creates a profile object from a credential address

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| id | * | nullable: undefined |
| extra | {} | nullable: undefined, optional: true, default: {} |

### `loggedIn(redirect: boolean): ExpressMiddleware`

Helper method that produces a middleware to handle successful logged in case.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| redirect | boolean | optional: true, default: false | redirect based login is used |

## `EmailAuth`

Email based login. Requies ```passport-local``` package.

### `constructor(options: object)`

### `emailSender: EmailSender`

Instance of email sender class for sending emails. If this is not specified, email login is disabled.

### `crypt: Crypt`

Instance of crypt class for encrypting and verifying passwords.

### `applicationName: string`

Name of application. Used for sending email.

### `fromAddress: string`

Email from address Used for sending email.

### `tokenExpiryMilliseconds: *`

### `block: *`

Settings for rate limiting failed requests. Note: use this or recaptcha.

### `recaptcha: *`

Settings for rate limiting through recaptcha. Note: use this or recaptcha.

### `allowPasswordSettingDuringRegistration: *`

If true, it remembers any passwords specified registration.

### `tokens: {}`

login security tokens

### `strategyImpl(req: *, username: *, password: *, done: *)`

logs users in based on token or based on username(email)/password

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| req | * | nullable: undefined |
| username | * | nullable: undefined |
| password | * | nullable: undefined |
| done | * | nullable: undefined |

### `passwordlessImpl(req: *, res: *): *`

sends temporary login password to email address

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| req | * | nullable: undefined |
| res | * | nullable: undefined |

### `install(app: *, prefix: *, passport: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| app | * | nullable: undefined |
| prefix | * | nullable: undefined |
| passport | * | nullable: undefined |

### `createProfileFromCredential(id: *, extra: {}): *`

helper method that creates a profile object from a credential address

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| id | * | nullable: undefined |
| extra | {} | nullable: undefined, optional: true, default: {} |

### `createUserFromProfile(profile: *): *`

Override of helper method that inserts password into produced user if allowed by setting.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| profile | * | nullable: undefined |

### `sendTemporaryPassword(theme: string, to: string, password: string, expireMinutes: number, loginLinkPrefix: string): *`

Helper method that sends temporary password to an email address for rego/login. Should be able to override this to specify custom formats for email.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| theme | string |  | register | recover | passwordless etc. anything other than login or verify |
| to | string |  | target email address |
| password | string |  | temporary login token |
| expireMinutes | number |  | number of minutes after which this login token will expire |
| loginLinkPrefix | string | optional: true | forward url for any links in email |

## `FacebookAuth`

OAuth login using facebook login provider Requires ```passport-facebook``` package.

### `constructor(options: object)`

### `facebookClientID: *`

OAuth 2 Client ID

### `facebookClientSecret: *`

OAuth 2 Client Secret

### `install(app: *, prefix: *, passport: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| app | * | nullable: undefined |
| prefix | * | nullable: undefined |
| passport | * | nullable: undefined |

## `GithubAuth`

OAuth login using githuhb login provider Requires ```passport-github2``` package.

### `constructor(options: object)`

### `githubClientID: *`

OAuth 2 Client ID

### `githubClientSecret: *`

OAuth 2 Client Secret

### `install(app: *, prefix: *, passport: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| app | * | nullable: undefined |
| prefix | * | nullable: undefined |
| passport | * | nullable: undefined |

## `GoogleAuth`

OAuth login using google login provider Requires ```passport-google-oauth2``` package.

### `constructor(options: object)`

### `googleClientID: *`

OAuth 2 Client ID

### `googleClientSecret: *`

OAuth 2 Client Secret

### `install(app: *, prefix: *, passport: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| app | * | nullable: undefined |
| prefix | * | nullable: undefined |
| passport | * | nullable: undefined |

## `LinkedinAuth`

OAuth login using linkedin login provider Requires ```passport-linkedin-oauth2``` package.

### `constructor(options: object)`

### `linkedinClientID: *`

OAuth 2 Client ID

### `linkedinClientSecret: *`

OAuth 2 Client Secret

### `install(app: *, prefix: *, passport: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| app | * | nullable: undefined |
| prefix | * | nullable: undefined |
| passport | * | nullable: undefined |

## `NoAuth`

Allows login without any form of credential exchange. Meant for testing / developer debugging etc.

### `constructor(options: object, options.method: string, options.loginUserId: string)`

### `loginUserId: *`

### `install(app: *, prefix: *)`

Make any request to /<method>/login.json to gain access.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| app | * | nullable: undefined |
| prefix | * | nullable: undefined |

## `Crypt`

Abstract class for taking care of password hashing and verification.

### `hash(password: string): string`

Hash a password.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| password | string |  | Password to hash |

### `hashImplementation(password_: string): string`

Implementation of hash() minus checks.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| password_ | string |  | Password to hash |

### `verify(password: String, hash: String): boolean`

Verify a password against previously hashed password

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| password | String |  | Password to compare |
| hash | String |  | Previously hashed password |

### `verifyImplementation(password: String, hash: String): boolean`

Implementation of verify() minus checks. Default implementation hashes new password and does string compare. This'll work for weaker hashes like md5 but won't work for stronger ones like scrypt.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| password | String |  | Password to compare |
| hash | String |  | Previously hashed password |

## `PBKDF2`

Use crypto.pbkdf2 implementation adapted from https://gist.github.com/skeggse/52672ddee97c8efec269

### `constructor(options: Object, options.hashDigest: String, options.hashBytes: Number, options.saltBytes: Number, options.iterations: Number)`

### `hashDigest: *`

### `hashBytes: *`

### `saltBytes: *`

### `iterations: *`

### `hashImplementation(password: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| password | * | nullable: undefined |

### `verifyImplementation(password: *, oldhash: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| password | * | nullable: undefined |
| oldhash | * | nullable: undefined |

## `SCRYPT`

Use scrypt. Requires scrypt (npm install scrypt).

### `constructor(options: Object, options.maxtime: Number)`

### `params: *`

### `hashImplementation(password: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| password | * | nullable: undefined |

### `verifyImplementation(password: *, hash: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| password | * | nullable: undefined |
| hash | * | nullable: undefined |

## `EmailFilter`

An email filter validates an email address

### `constructor(name: string)`

### `name: string`

name of filter

### `doesAllow(address_: string)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| address_ | string |  | address to validate |

## `EmailSender`

An email sender sends an email

### `constructor()`

### `filters: Array<EmailFilter>`

Filters to validate address with before sending emails to.

### `send(to: string, from: string, subject: string, body: string)`

Send an email. This performs various checks and calls sendImplementation

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| to | string |  | where to send email |
| from | string |  | reply address |
| subject | string |  | subject of email |
| body | string |  | content of email |

### `sendImplementation(to: string, from: string, subject: string, body: string)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| to | string |  | where to send email |
| from | string |  | reply address |
| subject | string |  | subject of email |
| body | string |  | content of email |

## `NodeEmailSender`

Stub email sending that prints to console instead of sending email.

### `sendImplementation(to: *, from: *, subject: *, body: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| to | * | nullable: undefined |
| from | * | nullable: undefined |
| subject | * | nullable: undefined |
| body | * | nullable: undefined |

## `NodeEmailSender`

Send email using node.js sendmail. Requires ```sendmail``` package.

### `sendImplementation(to: *, from: *, subject: *, body: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| to | * | nullable: undefined |
| from | * | nullable: undefined |
| subject | * | nullable: undefined |
| body | * | nullable: undefined |

## `SESEmailSender`

Send email using AWS SES. Requires ```aws-sdk``` package.

### `constructor()`

### `ses: *`

### `sendImplementation(to: *, from: *, subject: *, body: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| to | * | nullable: undefined |
| from | * | nullable: undefined |
| subject | * | nullable: undefined |
| body | * | nullable: undefined |

## `CollectionSessionStore`

Drop in replacement for express session store that saves session data in a collection.

### `constructor(collection: CachedCollection, options: object)`

### `collection: *`

collection wrapped

### `sessionsTTL: *`

Session dueation

### `cleanup()`

clean up expired sessions

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `get(sessionId: *, callback: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| sessionId | * | nullable: undefined |
| callback | * | nullable: undefined |

### `set(sessionId: *, session: *, callback: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| sessionId | * | nullable: undefined |
| session | * | nullable: undefined |
| callback | * | nullable: undefined |

### `destroy(sessionId: *, callback: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| sessionId | * | nullable: undefined |
| callback | * | nullable: undefined |

## `MemorySessionStore`

In memory session store. Apparently the default session store is not menat to be used for prouction or something. Will not scale horizontally.

### `constructor(options: object)`

### `sessions: {}`

In memory sessions list.

### `sessionsTTL: *`

Session dueation

### `cleanup()`

clean up expired sessions

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `get(sessionId: *, callback: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| sessionId | * | nullable: undefined |
| callback | * | nullable: undefined |

### `set(sessionId: *, session: *, callback: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| sessionId | * | nullable: undefined |
| session | * | nullable: undefined |
| callback | * | nullable: undefined |

### `destroy(sessionId: *, callback: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| sessionId | * | nullable: undefined |
| callback | * | nullable: undefined |

# Function

## `assign(user: *, field: *, value: *, fieldMeta: *, loginUser: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| user | * | nullable: undefined |
| field | * | nullable: undefined |
| value | * | nullable: undefined |
| fieldMeta | * | nullable: undefined |
| loginUser | * | nullable: undefined |

## `assign(user: *, field: *, value: *, fieldMeta: *, loginUser: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| user | * | nullable: undefined |
| field | * | nullable: undefined |
| value | * | nullable: undefined |
| fieldMeta | * | nullable: undefined |
| loginUser | * | nullable: undefined |

## `assign(user: *, field: *, value: *, fieldMeta: *, loginUser: *, config: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| user | * | nullable: undefined |
| field | * | nullable: undefined |
| value | * | nullable: undefined |
| fieldMeta | * | nullable: undefined |
| loginUser | * | nullable: undefined |
| config | * | nullable: undefined |

## `assign(user: *, field: *, value: *, fieldMeta: *, loginUser: *, config: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| user | * | nullable: undefined |
| field | * | nullable: undefined |
| value | * | nullable: undefined |
| fieldMeta | * | nullable: undefined |
| loginUser | * | nullable: undefined |
| config | * | nullable: undefined |

## `assign(user: *, field: *, value: *, fieldMeta: *, loginUser: *, config: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| user | * | nullable: undefined |
| field | * | nullable: undefined |
| value | * | nullable: undefined |
| fieldMeta | * | nullable: undefined |
| loginUser | * | nullable: undefined |
| config | * | nullable: undefined |

## `findMaxSequenceSize(password: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| password | * | nullable: undefined |

## `checkStrongPassword(password: *): boolean`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| password | * | nullable: undefined |

## `generate(length: number): string`

generate strong password

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| length | number | optional: true, default: 10 | length of password to generate |

## `parseFieldValues(output: *, searchField: *, field: *, values: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| output | * | nullable: undefined |
| searchField | * | nullable: undefined |
| field | * | nullable: undefined |
| values | * | nullable: undefined |

## `getDefaultOutput(searchMetadata: *): {"offset": *, "limit": *, "filter": *, "sort": *, "order": string, "extra": *, "returnFacets": *}`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| searchMetadata | * | nullable: undefined |

## `parse(searchMetadata: SearchMetadata, query: Query): ParsedQuery`

Validate and parse Request.query against what is acceptable from a SearchMetadata specification

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| searchMetadata | SearchMetadata |  |
| query | Query |  |

## `LOGGEDIN(req: *, res: *, next: *): *`

Express middleware for blocking non-logged in users

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| req | * | nullable: undefined |
| res | * | nullable: undefined |
| next | * | nullable: undefined |

## `ROLE_ONE_OF(roles: object): ExpressMiddlewareFunction`

Express middleware generator for blocking non-logged in users or users that do not have one of the specified roles

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| roles | object |  | map of roles |

## `audit(source: string, event: string, params: string)`

Fill in method for audit logging Use as req.audit(...) or res.audit(...)

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| source | string |  | source of event. e.g. user or ip |
| event | string |  | type of event. e.g. user or ip |
| params | string |  | data associated with event |

## `bootstrap(app: *, config: *): ExpressMiddleware`

Out boilerplate to make things easier.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| app | * | nullable: undefined |
| config | * | nullable: undefined |

## `callback(fn: Function, args: *): Promise`

Calls a callback caller that calls a callback call for async instead of using promises.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| fn | Function |  | function to call |
| args | * | optional: true | arguments to call function with |

## `defer(fn: Function, args: *)`

Call a function later.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| fn | Function |  | function to call |
| args | * |  | Can also specify 0 or more arguments to call function with. |

## `error(res: Response, message: string|object, audit: string, extra: string)`

Return error status and payload as response.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| res | Response |  | use as res.error(...) |
| message | string|object | optional: true, default: 'Failure' | error message to return; if a strig is specified, it will be converted to an error object |
| audit | string | optional: true, default: false | audit event type |
| extra | string | optional: true, default: undefined | extra audit payload which may help debug event |

## `generateId(): string`

Helper method that generates a new user id. This method uses current timestamp and random number generator to come up with unique ids.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

## `reject(res: Response, audit: string, extra: string): *`

Returns a function that calls res.error

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| res | Response |  | use as res.reject(...) |
| audit | string | optional: true, default: false | audit event type |
| extra | string | optional: true, default: undefined | extra audit payload which may help debug event |

## `resolve(res: Response, promiseObj: Promise, message: string|object, audit: string, extra: string)`

Monitors a Promise and returns success or error based on promise outcome.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| res | Response |  | use as res.resolve(...) |
| promiseObj | Promise |  | Promise objecy to monitor |
| message | string|object | optional: true, default: undefined | success or error message to return; if this is not specified, result of promise is returned. |
| audit | string | optional: true, default: false | audit event type. note that '_SUCCESS' or '_FAILURE' is attached to this type depenidng on outcome |
| extra | string | optional: true, default: undefined | extra audit payload which may help debug event |

## `success(res: Response, message: string|object, audit: string, extra: string)`

Return success status and payload as response.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| res | Response |  | use as res.success(...) |
| message | string|object | optional: true, default: 'Success' | success message to return |
| audit | string | optional: true, default: false | audit event type |
| extra | string | optional: true, default: undefined | extra audit payload which may help debug event |

## `failure(settings: object, settings.blockAttemptMs: number, settings.blockAttemptCount: number, settings.blockDurationMs: number): ExpressMiddlewareFunction`

Implementation of failure aware rate restriction. Will intercept monitor requests. After a certain number of failures, it will block for a duration. Requires ```block-failed``` package.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| settings | object | optional: true | settings for rate restriction, or null to disable |
| settings.blockAttemptMs | number |  | duration to monitor failure for |
| settings.blockAttemptCount | number |  | number of failures allowed in this duration |
| settings.blockDurationMs | number |  | duration to block for |

## `recaptcha(settings: object, settings.privateKey: string, settings.publicKey: string): ExpressMiddlewareFunction`

Implementation of reCAPTCHA rate restriction. Will validate recaptcha using req.body.recaptchaResponse value. Requires ```node-recaptcha2``` package.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| settings | object | optional: true | settings for recaptcha, or null to disable |
| settings.privateKey | string |  | also known as secret key |
| settings.publicKey | string |  | also known as site key |

## `setupAuthAPI(app: *, config: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| app | * | nullable: undefined |
| config | * | nullable: undefined |

## `setupAccountsAPI(app: *, config: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| app | * | nullable: undefined |
| config | * | nullable: undefined |

## `summariseUserRecord(user: *, fields: *, addiionalToInclude: {}): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| user | * | nullable: undefined |
| fields | * | nullable: undefined |
| addiionalToInclude | {} | nullable: undefined, optional: true, default: {} |

## `updateUserRecord(user: *, update: *, loginUser: *, config: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| user | * | nullable: undefined |
| update | * | nullable: undefined |
| loginUser | * | nullable: undefined |
| config | * | nullable: undefined |

## `summariseFields(inputFields: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| inputFields | * | nullable: undefined |

## `setup(app: Express, config: Config)`

Library entry point

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| app | Express |  | result of express() |
| config | Config |  | configuration |