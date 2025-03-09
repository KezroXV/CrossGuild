import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const ExclusiveDeals = () => {
  return (
    <div className="text-center font-sans">
      <h1 className="text-4xl text-purple-700">
        Exclusive Deals <span className="text-black">You Can’t Miss!</span>
      </h1>
      <div className="flex justify-around my-8">
        <div className="bg-purple-600 text-white p-6 rounded-lg w-2/5 relative">
          <div className="text-sm mb-2">GET A REDUCTION</div>
          <div>
            <h2 className="text-2xl">10% Off on Your First Order</h2>
            <p className="text-lg">
              Use Code <strong>FIRST10</strong>
            </p>
            <img
              src="path/to/image1.png"
              alt="Sale"
              className="absolute bottom-2 right-2 w-12 h-auto"
            />
          </div>
        </div>
        <div className="bg-purple-600 text-white p-6 rounded-lg w-2/5 relative">
          <div className="text-sm mb-2">FREE DELIVERY</div>
          <div>
            <h2 className="text-2xl">Free Shipping on Orders Over $50</h2>
            <p className="text-lg">
              delivery within <strong>48 hours</strong>
            </p>
            <img
              src="path/to/image2.png"
              alt="Delivery"
              className="absolute bottom-2 right-2 w-12 h-auto"
            />
          </div>
        </div>
      </div>
      <div className="bg-gray-200 p-6 rounded-lg mt-8">
        <div className="text-sm mb-2">Subscribe To Us</div>
        <h2 className="text-2xl text-purple-700">
          Stay Ahead of the <span className="text-black">Game!</span>
        </h2>
        <p className="text-lg my-4">
          Subscribe to our newsletter and be the first to know about exclusive
          deals, new arrivals, and gaming tips. Plus, enjoy 10% off your next
          order when you sign up!
        </p>
        <div className="flex justify-center items-center">
          <Input
            type="email"
            placeholder="Your Email"
            className="p-2 text-lg border border-gray-400 rounded-l-lg"
          />
          <Button className="p-2 text-lg bg-purple-700 text-white rounded-r-lg">
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExclusiveDeals;
