import Elysia, { t } from "elysia";
import { JwtPlugin } from "@/shared/plugins";
import { UserAdapter } from "../../adapters";
import { AuthProvider } from "../../provider/auth";
import { rateLimit } from "elysia-rate-limit";
import { Environment } from "@/config/environment";

export const AuthRouter = new Elysia()
  .group("/auth", (app) =>
    app
      .use(JwtPlugin)
      .use(
        rateLimit({
          duration: 1000 * 60 * 60 * 24, // a day
          max: Environment.NODE_ENV === "test" ? 1000 : 10,
          generator: (req, server) => server?.requestIP(req)?.address ?? "",
        }),
      )
      .post(
        "/sign-up",
        async ({ body, set, jwt, setCookie }) => {
          try {
            const { name, email, password } = body;

            const { isEmailValid } = await AuthProvider.validateEmail(email);

            if (!isEmailValid) {
              set.status = "Bad Request";
              return { error: "invalid email" };
            }

            const { data, error } = await AuthProvider.signUp({
              user: { name, email, password },
            });

            if (!data?.user || error) {
              throw new Error();
            }

            const token = await jwt.sign({ user: { id: data.user.id } });

            set.status = 201;
            setCookie("access_token", token);
            return {};
          } catch (error) {
            set.status = "Unauthorized";
            console.log({ error });
            return { error: "something went wrong" };
          }
        },
        {
          body: t.Object({
            name: t.String({ maxLength: 50, minLength: 2 }),
            email: t.String({ maxLength: 100, minLength: 5 }),
            password: t.String({ minLength: 14, maxLength: 20 }),
          }),
        },
      )
      .post(
        "/sign-in",
        async ({ body, jwt, set, setCookie }) => {
          const { email, password } = body;

          try {
            const { error, data } = await AuthProvider.signIn({
              credentials: { email, password },
            });

            if (error || !data?.user) throw new Error("bad credentials");

            const token = await jwt.sign({ user: { id: data.user.id } });

            set.status = "Accepted";
            setCookie("access_token", token);
            return {};
          } catch (error) {
            set.status = "Unauthorized";
            return {
              error:
                "it looks like youre using bad credentials, or the account doesnt exist, or the server had an error",
            };
          }
        },
        {
          body: t.Object({
            email: t.String({ maxLength: 100, minLength: 5 }),
            password: t.String({ minLength: 14, maxLength: 20 }),
          }),
        },
      )
      .get("/sign-out", ({ setCookie, set }) => {
        setCookie("access_token", "null", {
          expires: new Date(new Date().getTime() - 1),
        });
        set.status = 201;
        return {};
      }),
  )
  .group("/check-availability", (app) =>
    app
      .use(
        rateLimit({
          duration: 1000 * 60, // 1 minute
          max: 30,
          generator: (request, server) =>
            server?.requestIP(request)?.address ?? "",
        }),
      )
      .get(
        "/email/:email",
        async ({ params: { email }, set }) => {
          try {
            const { isEmailValid } = await AuthProvider.validateEmail(email);
            if (!isEmailValid) throw new Error();
          } catch (error) {
            set.status = "Bad Request";
            return { error: "email is malformatted" };
          }

          try {
            const { isEmailAvailable } =
              await AuthProvider.checkIfEmailIsAvailable(email);
            if (!isEmailAvailable) throw new Error();

            set.status = "OK";
            return {};
          } catch (error) {
            set.status = "Conflict";
            return { error: "email already in use" };
          }
        },
        {
          params: t.Object({
            email: t.String(),
          }),
        },
      ),
  )
  .group("/session", (app) =>
    app
      .use(JwtPlugin)
      .use(
        rateLimit({
          duration: 1000 * 60,
          max: 30,
          generator: (request, server) =>
            server?.requestIP(request)?.address ?? "",
        }),
      )
      .get("/token", async ({ cookie: { access_token }, set, jwt }) => {
        try {
          if (!access_token) {
            set.status = "Bad Request";
            return { error: "we could not find the token on the cookies" };
          }

          const tokenPayload = await jwt.verify(access_token);

          if (!tokenPayload) {
            set.status = "Unauthorized";
            return { error: "token signature is not valid" };
          }

          const { exp } = tokenPayload;

          if (!exp) {
            set.status = "Bad Request";
            return {
              error: "we could not find the expiration date on token",
            };
          }

          if (exp - new Date().getTime() <= 0) {
            set.status = "Unauthorized";
            return { error: "token expired" };
          }

          set.status = "Accepted";
          return {};
        } catch (error) {
          console.log(error);
          set.status = "Unauthorized";
          return { error: "token expired or unauthorized" };
        }
      }),
  );
