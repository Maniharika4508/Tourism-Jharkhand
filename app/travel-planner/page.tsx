"use client";

import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { useSearchParams } from "next/navigation";
import AOS from "aos";
import "aos/dist/aos.css";
import Link from "next/link";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

import {
  Bot,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Clock,
  Loader2,
  Mountain,
  Sparkles,
  Heart,
  Star,
  Download,
  Share2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface TravelPlannerForm {
  destination: string;
  startDate: string;
  endDate: string;
  interests: string[];
  budget: string;
  groupSize: string;
  accommodation: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    itinerary: string;
    requestDetails: TravelPlannerForm;
    generatedAt: string;
  };
  error?: string;
  fallback?: string;
}

function TravelPlannerContent() {
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState<TravelPlannerForm>({
    destination: "",
    startDate: "",
    endDate: "",
    interests: ["Culture", "Nature"],
    budget: "Medium",
    groupSize: "2-4 people",
    accommodation: "Hotels",
  });

  const [generatedItinerary, setGeneratedItinerary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
  }, []);

  useEffect(() => {
    const destination = searchParams.get("destination");

    if (destination) {
      setFormData((prev) => ({
        ...prev,
        destination: decodeURIComponent(destination),
      }));
    }
  }, [searchParams]);

  // Start date and end date are both counted.
  // Example:
  // Sep 1 -> Sep 5 = 5 days
  // Sep 1 -> Sep 10 = 10 days
  const calculateDurationNumber = (
    startDate: string,
    endDate: string
  ): number => {
    if (!startDate || !endDate) return 0;

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    const diffTime = end.getTime() - start.getTime();

    const diffDays = Math.round(
      diffTime / (1000 * 60 * 60 * 24)
    );

    return diffDays + 1;
  };

  const calculateDuration = (
    startDate: string,
    endDate: string
  ): string => {
    const days = calculateDurationNumber(startDate, endDate);

    if (days <= 0) return "0 days";
    if (days === 1) return "1 day";

    return `${days} days`;
  };

  const interestOptions = [
    "Adventure",
    "Culture",
    "Nature",
    "Wildlife",
    "Temples",
    "Waterfalls",
    "Photography",
    "Food",
    "History",
    "Trekking",
    "Spirituality",
    "Shopping",
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  // Dynamic fallback.
  // Even if AI/API fails, requested number of days will be generated.
  const createFallbackItinerary = (
    days: number,
    destination: string,
    budget: string,
    groupSize: string
  ) => {
    const activities = [
      "Arrival and local sightseeing",
      "Nature and waterfalls exploration",
      "Cultural and heritage places",
      "Local food and shopping",
      "Wildlife and scenic locations",
      "Temples and spiritual places",
      "Photography and local experiences",
      "Nearby attractions and viewpoints",
      "Relaxation and local exploration",
      "Final day sightseeing and departure",
    ];

    let result = `Customized Jharkhand Itinerary - ${destination}\n\n`;

    for (let day = 1; day <= days; day++) {
      const activity =
        activities[(day - 1) % activities.length];

      result += `Day ${day}: ${activity}\n`;
      result += `- Morning: Explore ${destination}\n`;
      result += `- Afternoon: Visit a nearby attraction\n`;
      result += `- Evening: Local food and sightseeing\n`;
      result += `- Night: Return to accommodation\n\n`;
    }

    result += `Estimated Budget: ${budget}\n`;
    result += `Travelers: ${groupSize}\n`;
    result += `Best Time: October to March\n`;
    result += `Travel Tip: Carry water, comfortable shoes and plan local transportation in advance.`;

    return result;
  };

  const generateItinerary = async () => {
    setIsGenerating(true);
    setError("");
    setShowResult(false);

    const durationNumber = calculateDurationNumber(
      formData.startDate,
      formData.endDate
    );

    const duration = calculateDuration(
      formData.startDate,
      formData.endDate
    );

    // Validate dates
    if (durationNumber <= 0) {
      setError("Please select valid travel dates.");
      setIsGenerating(false);
      return;
    }

    // Send numeric duration to backend.
    // Example: 10 instead of "2 weeks" or "10 days".
    const apiData = {
      destination: formData.destination,
      duration: durationNumber,
      interests: formData.interests,
      budget: formData.budget,
      groupSize: formData.groupSize,
      accommodation: formData.accommodation,
    };

    console.log("Sending travel planner data:", apiData);
    console.log("Requested exact days:", durationNumber);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "";

      const response = await fetch(
        `${baseUrl}/api/travel-planner/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        }
      );

      console.log(
        "Travel planner response status:",
        response.status
      );

      const data: ApiResponse = await response.json();

      console.log("Travel planner response:", data);

      const targetDest =
        formData.destination || "Jharkhand Highlights";

      const targetBud =
        formData.budget || "Medium";

      const targetGrp =
        formData.groupSize || "2 people";

      if (data.success && data.data?.itinerary) {
        setGeneratedItinerary(data.data.itinerary);
        setShowResult(true);
      } else {
        const fallbackText = createFallbackItinerary(
          durationNumber,
          targetDest,
          targetBud,
          targetGrp
        );

        setGeneratedItinerary(
          data.fallback || fallbackText
        );

        setShowResult(true);
      }
    } catch (err) {
      console.error(
        "Error generating itinerary:",
        err
      );

      const targetDest =
        formData.destination || "Jharkhand Highlights";

      const targetBud =
        formData.budget || "Medium";

      const targetGrp =
        formData.groupSize || "2 people";

      const fallbackText = createFallbackItinerary(
        durationNumber,
        targetDest,
        targetBud,
        targetGrp
      );

      setError(
        "AI service could not be reached. Showing a basic itinerary."
      );

      setGeneratedItinerary(fallbackText);
      setShowResult(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // ================================
  // DOWNLOAD PDF
  // ================================
  const downloadPDF = () => {
    if (!generatedItinerary) {
      alert("Please generate an itinerary first.");
      return;
    }

    const pdf = new jsPDF();

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 15;
    const maxWidth = pageWidth - margin * 2;

    let y = 20;

    // Title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text(
      "Jharkhand Travel Itinerary",
      margin,
      y
    );

    y += 10;

    // Trip details
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    const details = [
      `Destination: ${formData.destination}`,
      `Duration: ${calculateDuration(
        formData.startDate,
        formData.endDate
      )}`,
      `Dates: ${formData.startDate} to ${formData.endDate}`,
      `Budget: ${formData.budget}`,
      `Group Size: ${formData.groupSize}`,
    ];

    details.forEach((detail) => {
      const lines = pdf.splitTextToSize(
        detail,
        maxWidth
      );

      lines.forEach((line: string) => {
        if (y > pageHeight - 20) {
          pdf.addPage();
          y = 20;
        }

        pdf.text(line, margin, y);
        y += 7;
      });
    });

    y += 5;

    // Itinerary content
    const itineraryLines = generatedItinerary
      .replace(/\r/g, "")
      .split("\n");

    itineraryLines.forEach((line) => {
      const cleanLine = line
        .replace(/[*#]/g, "")
        .trim();

      if (!cleanLine) {
        y += 4;
        return;
      }

      if (y > pageHeight - 20) {
        pdf.addPage();
        y = 20;
      }

      // Day heading
      if (/^Day\s+\d+/i.test(cleanLine)) {
        y += 3;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);

        const dayLines = pdf.splitTextToSize(
          cleanLine,
          maxWidth
        );

        dayLines.forEach((dayLine: string) => {
          if (y > pageHeight - 20) {
            pdf.addPage();
            y = 20;
          }

          pdf.text(dayLine, margin, y);
          y += 8;
        });

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
      } else {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);

        const textLines = pdf.splitTextToSize(
          cleanLine,
          maxWidth
        );

        textLines.forEach((textLine: string) => {
          if (y > pageHeight - 20) {
            pdf.addPage();
            y = 20;
          }

          pdf.text(textLine, margin, y);
          y += 6;
        });
      }
    });

    const safeDestination =
      formData.destination
        ?.replace(/[^a-zA-Z0-9]/g, "-") || "Trip";

    pdf.save(
      `Jharkhand-Itinerary-${safeDestination}.pdf`
    );
  };

  // ================================
  // SHARE ITINERARY
  // ================================
  const shareItinerary = async () => {
    if (!generatedItinerary) {
      alert("Please generate an itinerary first.");
      return;
    }

    const shareText =
      `Jharkhand Travel Itinerary\n\n` +
      `Destination: ${formData.destination}\n` +
      `Duration: ${calculateDuration(
        formData.startDate,
        formData.endDate
      )}\n` +
      `Dates: ${formData.startDate} to ${formData.endDate}\n` +
      `Budget: ${formData.budget}\n\n` +
      generatedItinerary;

    try {
      // Mobile / supported browsers
      if (navigator.share) {
        await navigator.share({
          title: "My Jharkhand Travel Itinerary",
          text: shareText,
        });

        return;
      }

      // Clipboard API
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          shareText
        );

        alert(
          "Itinerary copied to clipboard. You can now share it anywhere."
        );

        return;
      }

      // Fallback for browsers without Clipboard API
      const textarea =
        document.createElement("textarea");

      textarea.value = shareText;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);

      textarea.focus();
      textarea.select();

      document.execCommand("copy");

      document.body.removeChild(textarea);

      alert(
        "Itinerary copied to clipboard. You can now share it anywhere."
      );
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const resetForm = () => {
    setShowResult(false);
    setGeneratedItinerary("");
    setError("");
  };

  const renderItinerary = () => {
    return generatedItinerary
      .split("\n")
      .map((line, index) => {
        const cleanLine = line
          .replace(/\*\*/g, "")
          .replace(/###/g, "")
          .replace(/##/g, "")
          .replace(/#/g, "")
          .trim();

        if (!cleanLine) {
          return (
            <div
              key={index}
              className="h-2"
            />
          );
        }

        // Day heading
        if (/^Day\s+\d+/i.test(cleanLine)) {
          return (
            <div
              key={index}
              className="mt-6 mb-4 first:mt-0"
            >
              <div
                className="p-4 rounded-lg border-l-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(244,208,63,0.15) 0%, rgba(128,0,32,0.15) 100%)",
                  borderLeftColor: "#f4d03f",
                }}
              >
                <h3
                  className="font-bold text-xl"
                  style={{ color: "#f4d03f" }}
                >
                  {cleanLine}
                </h3>
              </div>
            </div>
          );
        }

        // Bullet / activity
        if (
          cleanLine.startsWith("-") ||
          cleanLine.startsWith("•")
        ) {
          const text = cleanLine
            .replace(/^[-•]\s*/, "");

          return (
            <div
              key={index}
              className="mb-2"
            >
              <div
                className="p-3 rounded-md"
                style={{
                  background:
                    "rgba(255,255,255,0.05)",
                  color: "white",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    color: "#f4d03f",
                    marginRight: "8px",
                  }}
                >
                  •
                </span>

                {text}
              </div>
            </div>
          );
        }

        return (
          <div
            key={index}
            className="mb-2"
          >
            <p
              className="m-0 leading-relaxed"
              style={{
                color: "white",
                lineHeight: "1.7",
                textAlign: "left",
              }}
            >
              {cleanLine}
            </p>
          </div>
        );
      });
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="feature-icon">
              <Bot className="h-12 w-12" />
            </div>

            <h1
              data-aos="fade-up"
              className="text-center"
            >
              AI Travel Planner
              <span className="text-gold block">
                for Jharkhand
              </span>
            </h1>
          </div>

          <p
            data-aos="fade-up"
            data-aos-delay="200"
            className="text-center max-w-3xl mx-auto"
          >
            Let our advanced AI create personalized
            travel itineraries for your Jharkhand
            adventure. Discover hidden gems, cultural
            treasures, and natural wonders with
            intelligent planning.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div
              className="feature-card"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="feature-icon">
                <Sparkles className="h-8 w-8" />
              </div>

              <h3>AI-Powered</h3>

              <p>
                Intelligent recommendations based on
                your preferences
              </p>
            </div>

            <div
              className="feature-card"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <div className="feature-icon">
                <Mountain className="h-8 w-8" />
              </div>

              <h3>Jharkhand Focused</h3>

              <p>
                Specialized knowledge of local
                attractions and culture
              </p>
            </div>

            <div
              className="feature-card"
              data-aos="fade-up"
              data-aos-delay="500"
            >
              <div className="feature-icon">
                <Heart className="h-8 w-8" />
              </div>

              <h3>Personalized</h3>

              <p>
                Tailored to your interests, budget,
                and travel style
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="smart-tourism-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8">
            {!showResult ? (
              <div>
                <h2
                  className="text-center mb-4"
                  data-aos="fade-up"
                >
                  Plan Your Perfect Jharkhand Trip
                </h2>

                <p
                  className="subtitle text-center mb-8"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  Tell us about your preferences and
                  let AI create your ideal itinerary
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Form */}
                  <div
                    className="space-y-8"
                    data-aos="fade-up"
                    data-aos-delay="400"
                  >
                    {/* Destination */}
                    <div>
                      <label
                        className="block text-sm font-medium mb-3"
                        style={{
                          color: "#f4d03f",
                        }}
                      >
                        <MapPin className="inline h-4 w-4 mr-2" />
                        Primary Destination
                      </label>

                      <input
                        type="text"
                        placeholder="Enter destination (e.g., Ranchi, Deoghar, Jamshedpur)"
                        className="w-full rounded-md"
                        style={{
                          background:
                            "rgba(255,255,255,0.08)",
                          border:
                            "1px solid rgba(244,208,63,0.3)",
                          color: "white",
                          padding: "0.75rem",
                          height: "42px",
                        }}
                        value={formData.destination}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            destination:
                              e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Dates */}
                    <div>
                      <label
                        className="block text-sm font-medium mb-3"
                        style={{
                          color: "#f4d03f",
                        }}
                      >
                        <Calendar className="inline h-4 w-4 mr-2" />
                        Travel Dates
                      </label>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            className="block text-xs font-medium mb-2"
                            style={{
                              color:
                                "rgba(244,208,63,0.8)",
                            }}
                          >
                            Start Date
                          </label>

                          <input
                            type="date"
                            className="w-full rounded-md"
                            style={{
                              background:
                                "rgba(255,255,255,0.08)",
                              border:
                                "1px solid rgba(244,208,63,0.3)",
                              color: "white",
                              padding: "0.75rem",
                              height: "42px",
                            }}
                            value={formData.startDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                startDate:
                                  e.target.value,
                              })
                            }
                            min={
                              new Date()
                                .toISOString()
                                .split("T")[0]
                            }
                          />
                        </div>

                        <div>
                          <label
                            className="block text-xs font-medium mb-2"
                            style={{
                              color:
                                "rgba(244,208,63,0.8)",
                            }}
                          >
                            End Date
                          </label>

                          <input
                            type="date"
                            className="w-full rounded-md"
                            style={{
                              background:
                                "rgba(255,255,255,0.08)",
                              border:
                                "1px solid rgba(244,208,63,0.3)",
                              color: "white",
                              padding: "0.75rem",
                              height: "42px",
                            }}
                            value={formData.endDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                endDate:
                                  e.target.value,
                              })
                            }
                            min={
                              formData.startDate ||
                              new Date()
                                .toISOString()
                                .split("T")[0]
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="p-6 rounded-xl border-2 border-gold/30 bg-white/5">
                      <label
                        className="block text-sm font-medium mb-4"
                        style={{
                          color: "#f4d03f",
                        }}
                      >
                        <DollarSign className="inline h-4 w-4 mr-2" />
                        Budget Range
                      </label>

                      <div className="grid grid-cols-3 gap-3">
                        {[
                          {
                            value: "Budget",
                            label: "Budget",
                            range: "₹2,000-5,000",
                          },
                          {
                            value: "Medium",
                            label: "Medium",
                            range: "₹5,000-15,000",
                          },
                          {
                            value: "Luxury",
                            label: "Luxury",
                            range: "₹15,000+",
                          },
                        ].map((budget) => (
                          <button
                            key={budget.value}
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                budget:
                                  budget.value,
                              })
                            }
                            className="btn text-center"
                            style={{
                              backgroundColor:
                                formData.budget ===
                                budget.value
                                  ? "#f4d03f"
                                  : "transparent",
                              borderColor:
                                "#f4d03f",
                              color:
                                formData.budget ===
                                budget.value
                                  ? "#800020"
                                  : "#f4d03f",
                            }}
                          >
                            <div className="space-y-1">
                              <div className="font-semibold">
                                {budget.label}
                              </div>

                              <div className="text-xs">
                                {budget.range}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Group */}
                    <div className="p-6 rounded-xl border-2 border-gold/30 bg-white/5">
                      <label
                        className="block text-sm font-medium mb-4"
                        style={{
                          color: "#f4d03f",
                        }}
                      >
                        <Users className="inline h-4 w-4 mr-2" />
                        Group Size
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          {
                            value: "Solo",
                            label: "Solo Traveler",
                          },
                          {
                            value: "2-4 people",
                            label: "2-4 people",
                          },
                          {
                            value: "5-8 people",
                            label: "5-8 people",
                          },
                          {
                            value: "Large group",
                            label: "Large group (9+)",
                          },
                        ].map((group) => (
                          <button
                            key={group.value}
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                groupSize:
                                  group.value,
                              })
                            }
                            className="btn text-center"
                            style={{
                              backgroundColor:
                                formData.groupSize ===
                                group.value
                                  ? "#f4d03f"
                                  : "transparent",
                              borderColor:
                                "#f4d03f",
                              color:
                                formData.groupSize ===
                                group.value
                                  ? "#800020"
                                  : "#f4d03f",
                            }}
                          >
                            {group.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Interests */}
                    <div className="p-6 rounded-xl border-2 border-gold/30 bg-white/5">
                      <label
                        className="block text-sm font-medium mb-4"
                        style={{
                          color: "#f4d03f",
                        }}
                      >
                        <Star className="inline h-4 w-4 mr-2" />
                        Your Interests
                      </label>

                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {interestOptions.map(
                          (interest) => {
                            const selected =
                              formData.interests.includes(
                                interest
                              );

                            return (
                              <button
                                key={interest}
                                type="button"
                                onClick={() =>
                                  handleInterestToggle(
                                    interest
                                  )
                                }
                                className="btn text-xs font-medium"
                                style={{
                                  backgroundColor:
                                    selected
                                      ? "#f4d03f"
                                      : "transparent",
                                  borderColor:
                                    "#f4d03f",
                                  color: selected
                                    ? "#800020"
                                    : "#f4d03f",
                                  padding:
                                    "12px 8px",
                                }}
                              >
                                {interest}
                              </button>
                            );
                          }
                        )}
                      </div>

                      {formData.interests.length > 0 && (
                        <div className="mt-4 p-3 bg-gold/10 border border-gold/30 rounded-lg">
                          <p
                            style={{
                              color: "#f4d03f",
                            }}
                            className="text-sm font-medium"
                          >
                            Selected:{" "}
                            {
                              formData.interests
                                .length
                            }{" "}
                            interests
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preview */}
                  <div
                    data-aos="fade-up"
                    data-aos-delay="600"
                  >
                    <h3 className="text-xl font-semibold text-gold mb-6 flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Trip Preview
                    </h3>

                    <div
                      className="p-6 rounded-xl"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(244,208,63,0.1) 0%, rgba(128,0,32,0.1) 100%)",
                        border:
                          "2px solid rgba(244,208,63,0.4)",
                      }}
                    >
                      <div className="space-y-5">
                        <div className="p-3 rounded-lg bg-white/5 border border-gold/20">
                          <span
                            style={{
                              color: "#f4d03f",
                            }}
                          >
                            Destination
                          </span>

                          <p
                            className="font-semibold"
                            style={{
                              color: "white",
                            }}
                          >
                            {formData.destination ||
                              "Not selected"}
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-white/5 border border-gold/20">
                          <div className="flex items-center gap-3">
                            <Calendar
                              className="h-5 w-5"
                              style={{
                                color: "#f4d03f",
                              }}
                            />

                            <div>
                              <span
                                style={{
                                  color: "#f4d03f",
                                }}
                                className="text-sm font-medium"
                              >
                                Duration
                              </span>

                              <p
                                className="font-semibold"
                                style={{
                                  color: "white",
                                }}
                              >
                                {calculateDuration(
                                  formData.startDate,
                                  formData.endDate
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-white/5 border border-gold/20">
                          <div className="flex items-center gap-3">
                            <Clock
                              className="h-5 w-5"
                              style={{
                                color: "#f4d03f",
                              }}
                            />

                            <div>
                              <span
                                style={{
                                  color: "#f4d03f",
                                }}
                                className="text-sm font-medium"
                              >
                                Travel Dates
                              </span>

                              <p
                                className="font-semibold"
                                style={{
                                  color: "white",
                                }}
                              >
                                {formData.startDate &&
                                formData.endDate
                                  ? `${formData.startDate} to ${formData.endDate}`
                                  : "Not selected"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-white/5 border border-gold/20">
                            <span
                              style={{
                                color: "#f4d03f",
                              }}
                              className="text-sm"
                            >
                              Budget
                            </span>

                            <p
                              className="font-semibold"
                              style={{
                                color: "white",
                              }}
                            >
                              {formData.budget}
                            </p>
                          </div>

                          <div className="p-3 rounded-lg bg-white/5 border border-gold/20">
                            <span
                              style={{
                                color: "#f4d03f",
                              }}
                              className="text-sm"
                            >
                              Group
                            </span>

                            <p
                              className="font-semibold"
                              style={{
                                color: "white",
                              }}
                            >
                              {formData.groupSize}
                            </p>
                          </div>
                        </div>

                        {formData.interests.length >
                          0 && (
                          <div className="p-3 rounded-lg bg-white/5 border border-gold/20">
                            <span
                              style={{
                                color: "#f4d03f",
                              }}
                              className="text-sm font-medium"
                            >
                              Selected Interests
                            </span>

                            <div className="flex flex-wrap gap-2 mt-2">
                              {formData.interests.map(
                                (interest) => (
                                  <span
                                    key={interest}
                                    className="px-3 py-1 text-sm rounded-full border"
                                    style={{
                                      backgroundColor:
                                        "rgba(244,208,63,0.3)",
                                      borderColor:
                                        "rgba(244,208,63,0.5)",
                                      color: "white",
                                    }}
                                  >
                                    {interest}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {error && (
                        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-400" />

                            <span className="text-red-400 text-sm">
                              {error}
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={generateItinerary}
                        disabled={
                          isGenerating ||
                          formData.interests.length ===
                            0 ||
                          !formData.destination ||
                          !formData.startDate ||
                          !formData.endDate
                        }
                        className="btn primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Generating Your
                            Itinerary...
                          </>
                        ) : (
                          <>
                            <Bot className="mr-2 h-5 w-5" />
                            Generate AI
                            Itinerary
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Result */
              <div data-aos="fade-up">
                <div className="text-center mb-8">
                  <h2
                    className="text-4xl font-bold mb-4"
                    style={{
                      color: "#f4d03f",
                    }}
                  >
                    🎉 Your Personalized
                    Jharkhand Itinerary
                  </h2>

                  <p
                    className="text-lg mb-6"
                    style={{
                      color:
                        "rgba(255,255,255,0.9)",
                    }}
                  >
                    Crafted specially for your
                    perfect Jharkhand adventure
                  </p>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn secondary flex items-center gap-2 mx-auto"
                    style={{
                      background: "transparent",
                      border:
                        "2px solid rgba(244,208,63,0.8)",
                      color: "white",
                      borderRadius: "25px",
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Create New Plan
                  </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                  {/* Itinerary */}
                  <div className="xl:col-span-4">
                    <div
                      className="p-8 rounded-xl"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(244,208,63,0.15) 0%, rgba(128,0,32,0.15) 100%)",
                        border:
                          "2px solid rgba(244,208,63,0.4)",
                        boxShadow:
                          "0 12px 40px rgba(244,208,63,0.2)",
                      }}
                    >
                      <div className="mb-6">
                        <h3
                          className="text-2xl font-bold flex items-center gap-3 mb-4"
                          style={{
                            color: "#f4d03f",
                          }}
                        >
                          <Mountain className="h-6 w-6" />
                          Your Adventure Awaits
                        </h3>

                        <div
                          className="h-1 w-20 rounded-full mb-6"
                          style={{
                            background:
                              "#f4d03f",
                          }}
                        />
                      </div>

                      {/* No height restriction */}
                      <div
                        className="font-sans leading-relaxed p-8 rounded-lg"
                        style={{
                          color: "white",
                          background:
                            "rgba(0,0,0,0.3)",
                          border:
                            "1px solid rgba(244,208,63,0.3)",
                          fontSize: "15px",
                          lineHeight: "1.6",
                        }}
                      >
                        {renderItinerary()}
                      </div>

                      <div className="text-center mt-6">
                        <div
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                          style={{
                            background:
                              "rgba(244,208,63,0.2)",
                            border:
                              "1px solid rgba(244,208,63,0.4)",
                          }}
                        >
                          <Sparkles
                            className="h-4 w-4"
                            style={{
                              color: "#f4d03f",
                            }}
                          />

                          <span
                            style={{
                              color: "#f4d03f",
                              fontSize: "14px",
                              fontWeight: "600",
                            }}
                          >
                            AI-Generated
                            Itinerary •
                            Personalized for You
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <div
                      className="p-6 rounded-xl"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(128,0,32,0.15) 0%, rgba(244,208,63,0.15) 100%)",
                        border:
                          "2px solid rgba(244,208,63,0.4)",
                      }}
                    >
                      <h4
                        className="text-xl font-bold mb-6 flex items-center gap-2"
                        style={{
                          color: "#f4d03f",
                        }}
                      >
                        <Heart className="h-5 w-5" />
                        Trip Summary
                      </h4>

                      <div className="space-y-4 mb-8">
                        <div className="p-3 rounded-lg bg-white/5 border border-gold/20">
                          <div className="flex items-center justify-between gap-3">
                            <span
                              className="text-sm"
                              style={{
                                color:
                                  "rgba(255,255,255,0.8)",
                              }}
                            >
                              Destination
                            </span>

                            <span
                              style={{
                                color: "#f4d03f",
                              }}
                              className="font-semibold"
                            >
                              {formData.destination}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-white/5 border border-gold/20">
                          <div className="flex items-center justify-between gap-3">
                            <span
                              className="text-sm"
                              style={{
                                color:
                                  "rgba(255,255,255,0.8)",
                              }}
                            >
                              Duration
                            </span>

                            <span
                              style={{
                                color: "white",
                              }}
                              className="font-semibold"
                            >
                              {calculateDuration(
                                formData.startDate,
                                formData.endDate
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-white/5 border border-gold/20">
                          <div className="flex items-center justify-between gap-3">
                            <span
                              className="text-sm"
                              style={{
                                color:
                                  "rgba(255,255,255,0.8)",
                              }}
                            >
                              Dates
                            </span>

                            <span
                              style={{
                                color: "white",
                              }}
                              className="font-semibold text-xs"
                            >
                              {formData.startDate &&
                              formData.endDate
                                ? `${formData.startDate} to ${formData.endDate}`
                                : "Not selected"}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-white/5 border border-gold/20">
                          <div className="flex items-center justify-between">
                            <span
                              className="text-sm"
                              style={{
                                color:
                                  "rgba(255,255,255,0.8)",
                              }}
                            >
                              Budget
                            </span>

                            <span
                              style={{
                                color: "white",
                              }}
                              className="font-semibold"
                            >
                              {formData.budget}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-white/5 border border-gold/20">
                          <div className="flex items-center justify-between">
                            <span
                              className="text-sm"
                              style={{
                                color:
                                  "rgba(255,255,255,0.8)",
                              }}
                            >
                              Group
                            </span>

                            <span
                              style={{
                                color: "white",
                              }}
                              className="font-semibold"
                            >
                              {formData.groupSize}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="space-y-4">
                        <div className="text-center mb-4">
                          <h5
                            className="font-semibold mb-2"
                            style={{
                              color: "#f4d03f",
                            }}
                          >
                            Quick Actions
                          </h5>

                          <div
                            className="h-0.5 w-12 mx-auto rounded-full"
                            style={{
                              background:
                                "#f4d03f",
                            }}
                          />
                        </div>

                        {/* Download PDF */}
                        <button
                          type="button"
                          onClick={downloadPDF}
                          className="btn w-full flex items-center justify-center gap-2"
                          style={{
                            background: "#f4d03f",
                            color: "#800020",
                            border:
                              "2px solid #f4d03f",
                            borderRadius: "25px",
                            fontWeight: "600",
                            padding: "12px 24px",
                          }}
                        >
                          <Download className="h-4 w-4" />
                          Download PDF
                        </button>

                        {/* Share Itinerary */}
                        <button
                          type="button"
                          onClick={shareItinerary}
                          className="btn w-full flex items-center justify-center gap-2"
                          style={{
                            background:
                              "transparent",
                            color: "white",
                            border:
                              "2px solid rgba(244,208,63,0.8)",
                            borderRadius: "25px",
                            fontWeight: "600",
                            padding: "12px 24px",
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                          Share Itinerary
                        </button>

                        {/* Explore More */}
                        <Link
                          href="/destinations"
                          className="block"
                        >
                          <button
                            type="button"
                            className="btn w-full flex items-center justify-center gap-2"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(128,0,32,0.8) 0%, rgba(244,208,63,0.8) 100%)",
                              color: "white",
                              border:
                                "2px solid rgba(244,208,63,0.6)",
                              borderRadius: "25px",
                              fontWeight: "600",
                              padding: "12px 24px",
                            }}
                          >
                            <Mountain className="h-4 w-4" />
                            Explore More
                            Destinations
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function TravelPlannerPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-rose-500" />

            <p className="text-gray-400 animate-pulse">
              Loading Travel Planner...
            </p>
          </div>
        </div>
      }
    >
      <TravelPlannerContent />
    </React.Suspense>
  );
}