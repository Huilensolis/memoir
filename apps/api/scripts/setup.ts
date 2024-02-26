import { $ } from "bun";
import { Pool } from "pg";

async function startDocker() {
  const result = await $`docker compose up -d`;

  if (result.exitCode !== 0)
    throw new Error("error starting docker containers, volumes and networks");
}

async function awaitForDocker() {
  console.log("testing database connection...");

  return new Promise(async (resolve, reject) => {
    const pool = new Pool({
      host: "127.0.0.1",
      port: 5432,
      user: "memoir_user",
      password: "memoir_password",
      database: "memoir_db",
    });

    let error: any;
    for (let i = 0; i <= 10; i++) {
      await Bun.sleep(5000);
      try {
        await pool.connect();
        console.log("connected succesfully to database!");
        return resolve("");
      } catch (error) {
        console.log("database connection is not ready yet, retrying in 5s");
        console.log(`attempt ${i} of 10`);

        if (i <= 10) error = error;
      }
    }

    reject({ message: "database connection failed after 10 attempts", error });
  });
}

async function generateMigration() {
  console.log("generating migrations schemas...");

  try {
    const result = await $`drizzle-kit generate:pg`;

    if (result.exitCode !== 0)
      throw new Error("error generating migration schemas");

    return Promise.resolve("");
  } catch (error) {
    return Promise.reject({
      message: "error generating migration schemas",
      error,
    });
  }
}

async function runMigration() {
  console.log("running migration");

  const result = await $`bun ./scripts/migration.ts`;

  if (result.exitCode !== 0) {
    throw new Error("error running migrations");
  }
}

async function setup() {
  await startDocker();

  await awaitForDocker();

  await generateMigration();

  await runMigration();

  console.log(`                      /|      __
*             +      / |   ,-~ /             +
     .              Y :|  //  /                .         *
         .          | jj /( .^     *
               *    >-"~"-v"              .        *        .
*                  /       Y
   .     .        jo  o    |     .            +
                 ( ~T~     j                     +     .
      +           >._-' _./         +
               /| ;-"~ _  l      Database set up complete!
  .           / l/ ,-"~    \    + Happy Coding!
              \//\/      .- \
       +       Y        /    Y
               l       I     !
               ]\      _\    /"\
              (" ~----( ~   Y.  )
          ~~~~~~~~~~~~~~~~~~~~~~~~~~

`);
}

await setup();
process.exit(0);
