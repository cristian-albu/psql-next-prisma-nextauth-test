import Link from "next/link";
import React, { useState } from "react";
import prisma from "@/lib/prisma";
import { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";

const calendarHeader = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];

const serverHourList = [13, 14, 15, 16];

const hourList = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

const date = new Date();

const Index: NextPage = ({
  returnUsers,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [dateState, setDateState] = useState<string | null>(null);
  const [hourState, setHourState] = useState<{
    startingHour: number | null;
    endingHour: number | null;
    startingOpen: boolean;
    endingOpen: boolean;
  }>({
    startingHour: null,
    endingHour: null,
    startingOpen: false,
    endingOpen: false,
  });

  const dayOfTheWeek = date.getDay();

  let calendarList = [];

  for (let i = 0 - dayOfTheWeek - 6; i < 15 - dayOfTheWeek; i++) {
    let nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + i);

    let day = nextDay.getDate();
    let month = nextDay.getMonth() + 1;
    let dayOfTheWeek2 = nextDay.getDay();

    calendarList.push({
      id: `${day}/${month}-${dayOfTheWeek2}`,
      day: day,
      month: month,
      isToday: i == 0,
      isBeforeToday: i < 0,
    });
  }

  const handleEndingHour = (e: number) => {
    if (
      typeof hourState.startingHour === "number" &&
      typeof hourState.endingHour === "number" &&
      hourState.endingHour <= e
    ) {
      setHourState({
        ...hourState,
        endingHour: e + 1,
        startingHour: e,
        startingOpen: false,
      });
    } else {
      setHourState({ ...hourState, startingHour: e, startingOpen: false });
    }
  };

  return (
    <div className="pt-[3rem]  max-w-[600px] w-full mx-auto min-h-[100vh] relative">
      {(hourState.startingOpen || hourState.endingOpen) && (
        <div
          className="fixed top-0 left-0 w-full h-full z-[70] cursor-pointer"
          onClick={() =>
            setHourState({
              ...hourState,
              startingOpen: false,
              endingOpen: false,
            })
          }
        />
      )}
      <div className="grid grid-cols-7 w-full my-10">
        {calendarHeader.map((e: string) => (
          <div
            key={e}
            className="border-2 border-gray-100 p-4 flex justify-center items-center"
          >
            {e}
          </div>
        ))}
        {calendarList.map((e: any) => (
          <button
            key={e.id}
            className={`border-[1px] ${
              e.id == dateState ? "border-red-500" : "border-gray-100"
            } ${
              e.isToday
                ? "text-red-500"
                : e.isBeforeToday
                ? "text-gray-200"
                : "text-gray-500 hover:bg-red-500 hover:text-white"
            }  p-4 flex justify-center items-center transition `}
            disabled={e.isBeforeToday}
            onClick={() => setDateState(e.id)}
          >
            {e.day}
          </button>
        ))}
      </div>

      <div className="w-full flex justify-between relative">
        <h2>De la ora:</h2>

        <div className="w-[200px] mb-5 relative ">
          <button
            className={`w-full border-[1px]  p-4 border-gray-300 z-[80] relative`}
            onClick={() =>
              setHourState({
                ...hourState,
                startingOpen: !hourState.startingOpen,
              })
            }
          >
            {typeof hourState.startingHour === "number"
              ? `${hourState.startingHour} >`
              : "Alege ora >"}
          </button>
          <div
            className={`absolute top-[3.5rem] left-0  z-[80] shadow-lg ${
              hourState.startingOpen ? "scale-[1]" : "scale-0 "
            }`}
          >
            {hourList.map((e: number) => (
              <button
                key={e}
                disabled={serverHourList.includes(e)}
                className={`w-full border-[1px]  p-1 transition ${
                  e == hourState.startingHour
                    ? "border-red-500"
                    : serverHourList.includes(e)
                    ? "border-gray-100  text-gray-100 cursor-not-allowed"
                    : "text-black hover:bg-red-500 hover:text-white"
                }`}
                onClick={() => handleEndingHour(e)}
              >
                {e}:00 {serverHourList.includes(e) ? "Rezervat" : ""}
              </button>
            ))}
          </div>
        </div>

        <h2>Pana la ora:</h2>
        <div className="w-[200px] relative">
          <button
            className={`w-full border-[1px]  p-4 border-gray-300 z-[80] relative`}
            onClick={() =>
              setHourState({
                ...hourState,
                endingOpen: !hourState.endingOpen,
              })
            }
          >
            {typeof hourState.endingHour === "number"
              ? hourState.endingHour
              : "Alege ora"}
          </button>
          <div
            className={`absolute top-[3.5rem] left-0 z-[80]  shadow-lg ${
              hourState.endingOpen ? "scale-[1]" : "scale-0"
            }`}
          >
            {hourList.map((e: number) => (
              <button
                key={e}
                disabled={
                  serverHourList.includes(e) ||
                  (hourState.startingHour != undefined &&
                    hourState.startingHour >= e)
                }
                className={`w-full border-[1px]  p-1 transition ${
                  e == hourState.endingHour
                    ? "border-red-500"
                    : serverHourList.includes(e)
                    ? "border-gray-100  text-gray-100 cursor-not-allowed"
                    : "border-gray-300"
                } ${
                  hourState.startingHour && hourState.startingHour >= e
                    ? "text-gray-200"
                    : "text-black hover:bg-red-500 hover:text-white"
                }`}
                onClick={() =>
                  setHourState({
                    ...hourState,
                    endingHour: e,
                    endingOpen: false,
                  })
                }
              >
                {e}:00 {serverHourList.includes(e) ? "Rezervat" : ""}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

export const getStaticProps: GetStaticProps = async () => {
  const users = await prisma.user.findMany();

  const returnUsers = JSON.parse(JSON.stringify(users));
  return { props: { returnUsers } };
};
