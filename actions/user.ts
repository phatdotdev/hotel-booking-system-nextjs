"use server";

import { connectToDatabase } from "@/lib/data/mongoose";
import { getSession } from "@/lib/auth/session";
import { User } from "@/models/User";

export async function getUserAccount() {
  const session = await getSession();

  if (!session?.userId) {
    return {
      success: false,
      message: "Unauthorized. Please log in to continue.",
    };
  }

  try {
    await connectToDatabase();

    const rawUser = await User.findById(session.userId)
      .select(
        "fullName email phone dateOfBirth gender country city address role status createdAt",
      )
      .lean();

    if (!rawUser) {
      return {
        success: false,
        message: "User account not found.",
      };
    }
    const user = JSON.parse(JSON.stringify(rawUser));

    return {
      success: true,
      message: "User account fetched successfully.",
      user: {
        _id: user._id.toString(),
        fullName: user.fullName ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        gender: user.gender ?? "",
        country: user.country ?? "",
        city: user.city ?? "",
        address: user.address ?? "",
        role: user.role ?? "CUSTOMER",
        status: user.status ?? "Active",
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : "",
      },
    };
  } catch (error) {
    console.error("Error fetching user account:", error);

    return {
      success: false,
      message: "Failed to fetch user account. Internal server error.",
    };
  }
}

export async function updateUserAccount(formData: FormData) {
  try {
    // 1. Check authentication
    const session = await getSession();

    if (!session?.userId) {
      return {
        success: false,
        message: "You need to log in to update your account.",
      };
    }

    // 2. Get form data
    const fullName = formData.get("fullName");
    const phone = formData.get("phone");
    const dateOfBirth = formData.get("dateOfBirth");
    const gender = formData.get("gender");
    const country = formData.get("country");
    const city = formData.get("city");
    const address = formData.get("address");

    // 3. Validate form data types
    const fields = [
      fullName,
      phone,
      dateOfBirth,
      gender,
      country,
      city,
      address,
    ];

    if (fields.some((field) => typeof field !== "string")) {
      return {
        success: false,
        message: "Invalid form data. Please check your input.",
      };
    }

    // TypeScript narrowing after validation
    const trimmedFullName = (fullName as string).trim();
    const trimmedPhone = (phone as string).trim();
    const trimmedCountry = (country as string).trim();
    const trimmedCity = (city as string).trim();
    const trimmedAddress = (address as string).trim();
    const rawDateOfBirth = (dateOfBirth as string).trim();
    const rawGender = (gender as string).trim();

    // 4. Validate full name
    if (!trimmedFullName) {
      return {
        success: false,
        message: "Full name is required.",
      };
    }

    if (trimmedFullName.length < 2) {
      return {
        success: false,
        message: "Full name must be at least 2 characters.",
      };
    }

    if (trimmedFullName.length > 100) {
      return {
        success: false,
        message: "Full name cannot exceed 100 characters.",
      };
    }

    // 5. Validate phone
    if (trimmedPhone.length > 20) {
      return {
        success: false,
        message: "Phone number cannot exceed 20 characters.",
      };
    }

    // 6. Validate address fields
    if (trimmedCountry.length > 100) {
      return {
        success: false,
        message: "Country cannot exceed 100 characters.",
      };
    }

    if (trimmedCity.length > 100) {
      return {
        success: false,
        message: "City cannot exceed 100 characters.",
      };
    }

    if (trimmedAddress.length > 255) {
      return {
        success: false,
        message: "Address cannot exceed 255 characters.",
      };
    }

    // 7. Validate gender
    const allowedGenders = ["", "MALE", "FEMALE", "OTHER"];

    if (!allowedGenders.includes(rawGender)) {
      return {
        success: false,
        message: "Please select a valid gender.",
      };
    }

    // 8. Validate date of birth
    let parsedDateOfBirth: Date | null = null;

    if (rawDateOfBirth) {
      // Expected format: YYYY-MM-DD
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;

      if (!datePattern.test(rawDateOfBirth)) {
        return {
          success: false,
          message: "Please enter a valid date of birth.",
        };
      }

      const [year, month, day] = rawDateOfBirth.split("-").map(Number);

      const date = new Date(Date.UTC(year, month - 1, day));

      // Reject invalid dates such as 2026-02-31
      if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
      ) {
        return {
          success: false,
          message: "Please enter a valid date of birth.",
        };
      }

      // Reject future dates
      const today = new Date();
      const todayUTC = Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );

      if (date.getTime() > todayUTC) {
        return {
          success: false,
          message: "Date of birth cannot be in the future.",
        };
      }

      parsedDateOfBirth = date;
    }

    // 9. Connect to database
    await connectToDatabase();

    console.log(
      `User: ${JSON.stringify({
        fullName: trimmedFullName,
        phone: trimmedPhone,
        dateOfBirth: parsedDateOfBirth,
        gender: rawGender,
        country: trimmedCountry,
        city: trimmedCity,
        address: trimmedAddress,
      })}`,
    );

    // 10. Update account
    const updatedUser = await User.findByIdAndUpdate(
      session.userId,
      {
        $set: {
          fullName: trimmedFullName,
          phone: trimmedPhone,
          dateOfBirth: parsedDateOfBirth,
          gender: rawGender,
          country: trimmedCountry,
          city: trimmedCity,
          address: trimmedAddress,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
        strict: false,
      },
    ).select(
      "fullName email phone dateOfBirth gender country city address role isActive createdAt updatedAt",
    );

    // 11. Check whether the account exists
    if (!updatedUser) {
      return {
        success: false,
        message: "Account not found.",
      };
    }

    // 12. Return a plain object for Client Components
    return {
      success: true,
      message: "Account updated successfully.",
      user: {
        _id: updatedUser._id.toString(),
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone ?? "",
        dateOfBirth: updatedUser.dateOfBirth
          ? updatedUser.dateOfBirth.toISOString()
          : null,
        gender: updatedUser.gender ?? "",
        country: updatedUser.country ?? "",
        city: updatedUser.city ?? "",
        address: updatedUser.address ?? "",
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt
          ? updatedUser.createdAt.toISOString()
          : null,
        updatedAt: updatedUser.updatedAt
          ? updatedUser.updatedAt.toISOString()
          : null,
      },
    };
  } catch (error) {
    console.error("Update user account error:", error);

    return {
      success: false,
      message: "An unexpected error occurred while updating your account.",
    };
  }
}
