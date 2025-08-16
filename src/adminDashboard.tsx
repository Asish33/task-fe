import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";

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

export default function AdminDashboard() {
  const [cars, setCars] = useState<Car[] | null>(null);
  const [loadingCars, setLoadingCars] = useState(false);
  const [carsError, setCarsError] = useState<string | null>(null);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<string>("");
  const [color, setColor] = useState("");
  const [price, setPrice] = useState<string>("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const [searchColor, setSearchColor] = useState("");
  const [filteredCars, setFilteredCars] = useState<Car[] | null>(null);

  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const fetchCars = async () => {
    const storedToken = localStorage.getItem("token");
    const storedEmail = localStorage.getItem("email");
    if (!storedToken || !storedEmail) {
      setCarsError("Missing token or email. Please log in.");
      return;
    }

    setLoadingCars(true);
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
      setLoadingCars(false);
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

    // Then fetch fresh data
    fetchCars();
  }, []);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    []
  );

  const handleCarClick = (car: Car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCar(null);
    setBookingError(null);
    setBookingSuccess(null);
  };

  const handleBookCar = async () => {
    if (!selectedCar?._id) {
      setBookingError("Car ID not found");
      return;
    }

    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setBookingError("Missing token. Please log in.");
      return;
    }

    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(null);

    try {
      await axios.post(
        "https://task-hvun.onrender.com/book",
        { carId: selectedCar._id },
        { headers: { token: storedToken } }
      );
      setBookingSuccess("Car booked successfully!");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to book car";
      setBookingError(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSearchByColor = () => {
    if (!searchColor.trim()) {
      // If no color is entered, show all cars
      setFilteredCars(null);
      return;
    }

    if (!cars) {
      return;
    }

    // Filter cars by color using client-side logic
    const filtered = cars.filter(
      (car) =>
        car.color &&
        car.color.toLowerCase().includes(searchColor.trim().toLowerCase())
    );

    setFilteredCars(filtered);
  };

  // Update filtered cars when search color changes
  useEffect(() => {
    handleSearchByColor();
  }, [searchColor, cars]);

  const handleCreateCar = async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setCreateError("Missing token. Please log in.");
      return;
    }

    if (!make || !model || !year || !color || !price) {
      setCreateError("Please fill in all fields.");
      return;
    }

    const yearNumber = Number(year);
    const priceNumber = Number(price);
    if (Number.isNaN(yearNumber) || Number.isNaN(priceNumber)) {
      setCreateError("Year and Price must be valid numbers.");
      return;
    }

    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);
    try {
      await axios.post(
        "https://task-hvun.onrender.com/cars",
        {
          make,
          model,
          year: yearNumber,
          color,
          price: priceNumber,
        },
        { headers: { token: storedToken } }
      );
      setCreateSuccess("Car created successfully.");
      setMake("");
      setModel("");
      setYear("");
      setColor("");
      setPrice("");
      fetchCars(); // Refresh the cars list after creating a new car
    } catch (error: any) {
      setCreateError(error.response?.data?.message || "Failed to create car");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Admin Dashboard - Create a Car</CardTitle>
          <CardDescription>
            Fill in details and submit to add a car to the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                type="text"
                placeholder="Mercedes-Benz"
                value={make}
                onChange={(e) => setMake(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                type="text"
                placeholder="C-Class"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                placeholder="2024"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min={1886}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="text"
                placeholder="Red"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                placeholder="55000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min={0}
                step={100}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                onClick={handleCreateCar}
                disabled={createLoading}
              >
                {createLoading ? "Creating..." : "Create car"}
              </Button>
            </div>
            {(createError || createSuccess) && (
              <div className="sm:col-span-2">
                {createError && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {createError}
                  </div>
                )}
                {createSuccess && (
                  <div className="mt-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    {createSuccess}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">All Cars</CardTitle>
            <CardDescription>
              {Array.isArray(cars)
                ? `${filteredCars ? filteredCars.length : cars.length} item${
                    (filteredCars ? filteredCars.length : cars.length) === 1
                      ? ""
                      : "s"
                  }${filteredCars ? ` (filtered from ${cars.length})` : ""}`
                : "—"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Search by color..."
                value={searchColor}
                onChange={(e) => setSearchColor(e.target.value)}
                className="w-32"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchCars}
              disabled={loadingCars}
            >
              {loadingCars ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
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

          {loadingCars && (
            <div className="grid gap-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-lg border p-4 bg-white"
                >
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {Array.isArray(cars) && !loadingCars && (
            <div className="grid gap-3 sm:grid-cols-2">
              {(filteredCars || cars).length === 0 ? (
                <div className="text-sm text-gray-600">
                  {searchColor.trim()
                    ? `No cars found with color "${searchColor}".`
                    : "No cars found."}
                </div>
              ) : (
                (filteredCars || cars).map((car, idx) => (
                  <div
                    key={(car as any)._id ?? (car as any).id ?? idx}
                    className="rounded-lg border p-4 bg-white hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => handleCarClick(car)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-base font-semibold text-gray-900">
                        {(car.make ?? "").toString()}{" "}
                        {(car.model ?? "").toString()}
                      </div>
                      <div className="text-base font-semibold text-gray-900">
                        {car.price != null
                          ? currencyFormatter.format(car.price)
                          : "—"}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      {car.year && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                          {car.year}
                        </span>
                      )}
                      {car.color && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                          <span
                            className="h-2 w-2 rounded-full border"
                            style={{
                              backgroundColor: String(car.color).toLowerCase(),
                            }}
                          />
                          {car.color}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Car Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          selectedCar
            ? `${selectedCar.make} ${selectedCar.model}`
            : "Car Details"
        }
      >
        {selectedCar && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Make
                </Label>
                <p className="text-lg font-semibold">
                  {selectedCar.make || "—"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Model
                </Label>
                <p className="text-lg font-semibold">
                  {selectedCar.model || "—"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Year
                </Label>
                <p className="text-lg">{selectedCar.year || "—"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Color
                </Label>
                <div className="flex items-center gap-2">
                  {selectedCar.color && (
                    <span
                      className="h-4 w-4 rounded-full border"
                      style={{
                        backgroundColor: String(
                          selectedCar.color
                        ).toLowerCase(),
                      }}
                    />
                  )}
                  <p className="text-lg">{selectedCar.color || "—"}</p>
                </div>
              </div>
              <div className="col-span-2">
                <Label className="text-sm font-medium text-gray-500">
                  Price
                </Label>
                <p className="text-2xl font-bold text-green-600">
                  {selectedCar.price != null
                    ? currencyFormatter.format(selectedCar.price)
                    : "—"}
                </p>
              </div>
            </div>

            {selectedCar._id && (
              <div className="pt-4 border-t">
                <Label className="text-sm font-medium text-gray-500">
                  Car ID
                </Label>
                <p className="text-sm text-gray-600 font-mono">
                  {selectedCar._id}
                </p>
              </div>
            )}

            {selectedCar.userId && (
              <div className="pt-4 border-t">
                <Label className="text-sm font-medium text-gray-500">
                  User ID
                </Label>
                <p className="text-sm text-gray-600 font-mono">
                  {selectedCar.userId}
                </p>
              </div>
            )}

            {selectedCar.createdAt && (
              <div className="pt-4 border-t">
                <Label className="text-sm font-medium text-gray-500">
                  Created At
                </Label>
                <p className="text-sm text-gray-600">
                  {new Date(selectedCar.createdAt).toLocaleString()}
                </p>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button
                onClick={handleBookCar}
                disabled={bookingLoading}
                className="w-full"
              >
                {bookingLoading ? "Booking..." : "Book"}
              </Button>

              {bookingError && (
                <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                  {bookingError}
                </div>
              )}

              {bookingSuccess && (
                <div className="mt-2 rounded-md border border-green-200 bg-green-50 p-2 text-sm text-green-700">
                  {bookingSuccess}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
