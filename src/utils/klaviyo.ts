"server-only";

import {
  ApiKeySession,
  EventsApi,
  GetProfileResponseData,
  PostProfileResponseData,
  ProfilesApi,
} from "klaviyo-api";

import { ContactProperties } from "@/types/klaviyo";
import { Err, Ok, Result } from "@/types/result";

const initializeSession = (): ApiKeySession => {
  const apiKey = process.env.KLAVIYO_API_KEY!;
  if (!apiKey) {
    throw new Error("KLAVIYO_API_KEY is required");
  }
  return new ApiKeySession(apiKey);
};

// Handles the execution of Klaviyo API requests and wraps them in Result
const doRequest = async <T>(
  req: Promise<T>,
): Promise<Result<T | null, Error>> => {
  try {
    const data = await req;
    return Ok(data);
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
};

const getContactByEmail = async (
  email: string,
): Promise<Result<GetProfileResponseData | null, Error>> => {
  const session = initializeSession();
  const profiles = new ProfilesApi(session);
  try {
    const profilesResult = await doRequest(
      profiles.getProfiles({
        filter: `equals(email,"${email}")`,
      }),
    );

    if (profilesResult.isErr()) {
      return profilesResult.errInto();
    }

    const found = profilesResult?.unwrap()?.body?.data ?? [];
    return Ok(found[0] ?? null);
  } catch (error) {
    return Err(
      error instanceof Error ? error : new Error("Failed to fetch contact"),
    );
  }
};

export const upsertContact = async (
  email: string,
  properties: ContactProperties,
): Promise<Result<PostProfileResponseData | null, Error>> => {
  const session = initializeSession();
  const profiles = new ProfilesApi(session);
  try {
    const contactResult = await getContactByEmail(email);
    if (contactResult.isErr()) {
      return contactResult.errInto();
    }

    const contact = contactResult?.unwrap();
    const { firstName, lastName, userId, phoneNumber, ...rest } = properties;
    const upsertResult = await doRequest(
      profiles.createOrUpdateProfile({
        data: {
          type: "profile",
          id: contact?.id,
          attributes: {
            email,
            firstName,
            lastName,
            phoneNumber,
            externalId: userId,
            properties: rest,
          },
        },
      }),
    );
    if (upsertResult.isErr()) {
      return upsertResult.errInto();
    }

    return Ok(upsertResult?.unwrap()?.body?.data ?? null);
  } catch (error) {
    return Err(
      error instanceof Error ? error : new Error("Failed to upsert contact"),
    );
  }
};

export const sendEvent = async (
  email: string,
  eventName: string,
  properties: Record<string, unknown> | null,
): Promise<Result<null, Error>> => {
  const session = initializeSession();
  const contactResult = await getContactByEmail(email);
  if (contactResult.isErr()) {
    return contactResult.errInto();
  }

  const contact = contactResult.unwrap();
  const events = new EventsApi(session);
  try {
    const createEventResult = await doRequest(
      events.createEvent({
        data: {
          type: "event",
          attributes: {
            properties: properties ?? {},
            metric: {
              data: {
                type: "metric",
                attributes: {
                  name: eventName,
                  service: "api",
                },
              },
            },
            profile: {
              data: {
                type: "profile",
                id: contact?.id,
                attributes: {
                  email,
                },
              },
            },
          },
        },
      }),
    );
    if (createEventResult.isErr()) {
      return createEventResult.errInto();
    }

    return Ok(null);
  } catch (error) {
    return Err(
      error instanceof Error ? error : new Error("Failed to send event"),
    );
  }
};
