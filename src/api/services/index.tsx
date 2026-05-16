import React from "react";
import { StoreProvider as UserStoreProvider } from "./User";

/**
 * Registry of every store provider that should wrap the app.
 *
 * Order matters: providers compose outer-to-inner. A provider listed earlier
 * is mounted *outside* later ones, so later providers can consume context
 * from earlier ones (e.g. an auth store later in the list could read from
 * a config store earlier).
 *
 * To add a new store: create the folder under `api/services/`, export a
 * `StoreProvider`, and add it here.
 */
const STORE_PROVIDERS: React.FC[] = [UserStoreProvider];

export const StoreProviders: React.FC = ({ children }) =>
  STORE_PROVIDERS.reduceRight<React.ReactElement>(
    (acc, Provider) => <Provider>{acc}</Provider>,
    <>{children}</>
  );