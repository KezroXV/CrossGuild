"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import sale from "@/public/sale.svg";
import ship from "@/public/ship.svg";
import news from "@/public/news.svg";
import reduc from "@/public/reduc.svg";
import deli from "@/public/deli.svg";
import Image from "next/image";

const slideFromLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0 },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0 },
};

const slideFromBottom = {
  hidden: { opacity: 0, y: 100 },
  visible: { opacity: 1, y: 0 },
};

const ExclusiveDeals = () => {
  return (
    <div className="text-left ">
      <h1 className="text-4xl font-bold text-accent w-fit ml-48">
        Exclusive Deals <span className="text-black">You Can’t Miss!</span>
      </h1>
      <div className="flex  w-4/5 mx-auto justify-between my-8">
        <motion.div
          className="bg-gradient-to-bl shadow-md from-[#988AE6] to-accent flex justify-evenly text-white p-10 rounded-lg relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideFromLeft}
          transition={{ duration: 1 }}
        >
          <div>
            <div className="text-sm  mb-2">
              <Image src={reduc} alt="reduc" className=" h-auto" />
            </div>
            <div className="mt-7">
              <h2 className="text-left text-3xl font-bold">
                10% Off on Your First Order
              </h2>
              <p className="text-4xl font-bold text-center">
                Use Code <strong className="text-[#252B42]">FIRST10</strong>
              </p>
            </div>
          </div>
          <Image src={sale} alt="Sale" className="flex justify-center " />
        </motion.div>
        <motion.div
          className="bg-gradient-to-br shadow-md from-[#988AE6] to-accent flex justify-evenly text-white p-10 rounded-lg relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideFromRight}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className="text-sm mb-2">
              <Image src={deli} alt="delivery" className=" h-auto" />
            </div>
            <div className="mt-7">
              <h2 className="text-center text-3xl font-bold">
                Free Shipping on Orders Over $50
              </h2>
              <p className="text-4xl font-bold text-center">
                delivery within <br />
                <strong className="text-[#252B42]">48 hours</strong>
              </p>
            </div>
          </div>
          <Image src={ship} alt="ship" className="flex justify-center " />
        </motion.div>
      </div>

      {/* Newsletter */}
      <motion.div
        className="bg-primary/30 flex shadow-md justify-between p-12 rounded-lg mt-8 w-4/5 m-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={slideFromBottom}
        transition={{ duration: 0.5 }}
      >
        <div>
          <div className="text-sm mb-5 px-4 py-3 w-fit text-white bg-primary">
            Subscribe To Us
          </div>
          <h2 className="text-3xl text-black font-bold">
            Stay Ahead of the <span className="text-accent">Game!</span>
          </h2>
          <p className="text-lg mb-5 w-5/6 my-4">
            Subscribe to our newsletter and be the first to know about exclusive
            deals, new arrivals, and gaming tips. Plus, enjoy 10% off your next
            order when you sign up!
          </p>
          <div className="flex justify-left items-center">
            <Input
              type="email"
              placeholder="Your Email"
              className="p-2 h-12 w-3/6 bg-white text-lg border border-gray-400 rounded-l-lg rounded-r-none"
            />
            <Button className="p-2 h-12 text-lg bg-accent text-white rounded-r-lg rounded-l-none">
              Subscribe
            </Button>
          </div>
        </div>
        <Image
          src={news}
          alt="news"
          width={250}
          height={250}
          className="flex justify-center "
        />
      </motion.div>
    </div>
  );
};

export default ExclusiveDeals;
