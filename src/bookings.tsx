import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type Car = {
  _id?: string;
  id?: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  price?: number;
  userId?: string;
  createdAt?: string;
  __v?: number;
};

export default function Bookings() {
  const [cars, setCars] = useState<Car[] | null>(null);
  const [bookings, setBookings] = useState<any[] | null>(null);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [carsLoading, setCarsLoading] = useState(false);
  const [carsError, setCarsError] = useState<string | null>(null);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    []
  );

  const fetchCars = async () => {
    const storedToken = localStorage.getItem("token");
    const storedEmail = localStorage.getItem("email");
    if (!storedToken || !storedEmail) {
      setCarsError("Missing token or email. Please log in.");
      return;
    }

    setCarsLoading(true);
    setCarsError(null);
    try {
      const response = await axios.get("https://task-hvun.onrender.com/cars", {
        headers: { token: storedToken },
      });
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data ?? response.data;
      setCars(data);
      // Store cars data in localStorage for persistence
      localStorage.setItem("cars", JSON.stringify(data));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch cars";
      setCarsError(errorMessage);

      // Keep existing cars data if it's a rate limit error
      if (
        errorMessage.toLowerCase().includes("too many request") ||
        errorMessage.toLowerCase().includes("rate limit") ||
        errorMessage.toLowerCase().includes("429")
      ) {
        // Don't clear cars data, just show the error
      } else {
        // For other errors, clear the cars data
        setCars(null);
        localStorage.removeItem("cars");
      }
    } finally {
      setCarsLoading(false);
    }
  };

  const fetchBookings = async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setBookingsError("Missing token. Please log in.");
      return;
    }

    setBookingsLoading(true);
    setBookingsError(null);

    try {
      const response = await axios.get(
        "https://task-hvun.onrender.com/getBookings",
        {
          headers: { token: storedToken },
        }
      );

      // Handle the response format with bookings array
      const bookingsData = response.data?.bookings || response.data;
      const data = Array.isArray(bookingsData) ? bookingsData : [];
      setBookings(data);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch bookings";
      setBookingsError(errorMessage);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    // Try to restore cars data from localStorage first
    const storedCars = localStorage.getItem("cars");
    if (storedCars) {
      try {
        const parsedCars = JSON.parse(storedCars);
        if (Array.isArray(parsedCars)) {
          setCars(parsedCars);
        }
      } catch (e) {
        // If parsing fails, remove invalid data
        localStorage.removeItem("cars");
      }
    }

    // Fetch fresh data
    fetchCars();
    fetchBookings();
  }, []);

  const handleRefresh = () => {
    fetchCars();
    fetchBookings();
  };

  const handleBackToDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600">View all your car bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleBackToDashboard}
          >
            ← Back to Dashboard
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleRefresh}
            disabled={bookingsLoading || carsLoading}
          >
            {bookingsLoading || carsLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bookings</CardTitle>
          <CardDescription>
            {Array.isArray(bookings)
              ? `${bookings.length} booking${bookings.length === 1 ? "" : "s"}`
              : "—"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {carsError && (
            <div
              className={`mb-3 rounded-md border p-3 text-sm ${
                carsError.toLowerCase().includes("too many request") ||
                carsError.toLowerCase().includes("rate limit") ||
                carsError.toLowerCase().includes("429")
                  ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {carsError.toLowerCase().includes("too many request") ||
              carsError.toLowerCase().includes("rate limit") ||
              carsError.toLowerCase().includes("429")
                ? "⚠️ Rate limit reached. Showing last fetched data. Please wait before refreshing."
                : carsError}
            </div>
          )}

          {bookingsError && (
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {bookingsError}
            </div>
          )}

          {bookingsLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading bookings...</p>
            </div>
          )}

          {!bookingsLoading && !bookingsError && (
            <>
              {Array.isArray(bookings) && bookings.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No bookings found
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    You haven't made any car bookings yet.
                  </p>
                  <div className="mt-6">
                    <Button onClick={handleBackToDashboard}>
                      Browse Cars
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(bookings) &&
                    bookings.map((booking, idx) => {
                      // Find the car details from the cars list using carId
                      const carDetails = cars?.find(
                        (car) => car._id === booking.carId
                      );

                      return (
                        <div
                          key={booking._id || booking.id || idx}
                          className="border rounded-lg p-6 bg-white hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {carDetails ? (
                                <>
                                  <div className="flex items-center gap-3 mb-3">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                      {carDetails.make} {carDetails.model}
                                    </h3>
                                    {carDetails.price && (
                                      <span className="text-lg font-medium text-green-600">
                                        {currencyFormatter.format(carDetails.price)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                    {carDetails.year && (
                                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                                        {carDetails.year}
                                      </span>
                                    )}
                                    {carDetails.color && (
                                      <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                                        <span
                                          className="h-3 w-3 rounded-full border"
                                          style={{
                                            backgroundColor: String(
                                              carDetails.color
                                            ).toLowerCase(),
                                          }}
                                        />
                                        {carDetails.color}
                                      </span>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    Car ID: {booking.carId}
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-4">
                                    Car details not available
                                  </p>
                                </>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">
                                <p className="font-medium">Booked on</p>
                                <p>
                                  {booking.bookingDate &&
                                    new Date(booking.bookingDate).toLocaleDateString()}
                                </p>
                                <p>
                                  {booking.bookingDate &&
                                    new Date(booking.bookingDate).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="pt-4 border-t flex items-center justify-between text-xs">
                            {booking._id && (
                              <p className="text-gray-400 font-mono">
                                Booking ID: {booking._id}
                              </p>
                            )}
                            {booking.carId && (
                              <p className="text-gray-400 font-mono">
                                Car ID: {booking.carId}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
