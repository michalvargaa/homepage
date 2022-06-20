import { useEffect, useState } from 'react';
import axios from 'axios';

import { ReactComponent as Random } from './assets/svgs/random.svg';
import sunrise from './assets/backgroundImages/sunrise.jpg';
import afternoon from './assets/backgroundImages/afternoon.jpg';
import evening from './assets/backgroundImages/evening.jpg';



interface Quote {
  author: string;
  content: string;
}
interface TimeZone {
  abbr: string;
  timezone: string;
  dayOfYear: number;
}



interface Weather {
  temperatureC: number;
  temperatureF: number;
  conditionText: string;
  icon: string;
}

interface Date {
  date: string;
  day: string;
  month: string;
}


const App: React.FC = () => {
  const [time, setTime] = useState<string>(
    `${new Date().getHours()}:${new Date().getMinutes()}`
  );
  const [partOfTheDayText, setPartOfTheDayText] = useState<string>();
  const [timezone, setTimezone] = useState<TimeZone>({} as TimeZone);
  const [imageURL, setImageURL] = useState<string>('');
  const [quote, setQuote] = useState<Quote>({} as Quote);
  const [date, setDate] = useState<Date>({} as Date);
  const [nameday, setNameday] = useState<string>('');
  const [weather, setWeather] = useState<Weather>({
    temperatureC: 0,
    temperatureF: 0,
    conditionText: '',
    icon: '',
  });

  const getTimezone = async () => {
    const response = await axios.get('https://worldtimeapi.org/api/ip');
    const data = await response.data;

    setTimezone({
      abbr: data.abbreviation,
      timezone: data.timezone.split('/').reverse().join(', '),
      dayOfYear: data.day_of_year,
    });
  };

  const getQuote = async () => {
    const response = await axios.get('https://api.quotable.io/random/');
    const data = await response.data;

    setQuote({
      author: data.author === null ? 'Unknown author' : data.author,
      content: data.content,
    });
  };

  const getNameday = async () => {
    const response = await axios.get('https://nameday.abalin.net/api/V1/today');
    const data = await response.data;

    setNameday(data.nameday.sk);
  };

  const getTime = () => {
    const currentTime = new Date();
    let hour: string = String(currentTime.getHours());
    let minute: string = String(currentTime.getMinutes());

    if (Number(minute) < 10) minute = minute.padStart(2, '0');
    if (Number(hour) < 10) hour = hour.padStart(2, '0');

    setTime(`${hour}:${minute}`);


    if (Number(hour) >= 4 && Number(hour) < 12) {
      setPartOfTheDayText('Good Morning');
      setImageURL(sunrise);
    } else if (Number(hour) >= 12 && Number(hour) < 18) {
      setPartOfTheDayText('Good Afternoon');
      setImageURL(afternoon);
    } else {
      setPartOfTheDayText('Good Evening');
      setImageURL(evening);
    }
  };

  const getWeatherBasedOnLocation = () => {
    const success = async (position: GeolocationPosition) => {
      const response = await axios.get(
        `http://api.weatherapi.com/v1/current.json?key=${
          process.env.REACT_APP_API_KEY
        }&q=${position.coords.latitude},${position.coords.longitude}&aqi=no`
      );
      const data = await response.data;
      console.log(data);
      data &&
        setWeather({
          temperatureC: data.current.temp_c,
          temperatureF: data.current.temp_f,
          conditionText: data.current.condition.text,
          icon: data.current.condition.icon,
        });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success);
    }
  };

  useEffect(() => {
    getTime();
    getTimezone();
    getQuote();
    getNameday();

    setDate({
      date: new Intl.DateTimeFormat(navigator.language).format(new Date()),
      day: new Date().toLocaleString('default', { weekday: 'long' }),
      month: new Date().toLocaleString('default', { month: 'long' }),
    });
    getWeatherBasedOnLocation();

    const updateEveryMinute = setInterval(() => {
      getTime();
    }, 60000- new Date().getSeconds() * 1000 );

    return () => {
      clearInterval(updateEveryMinute);
    }
  }, [])


  return (
    <main className='w-screen h-screen relative overflow-x-hidden scrollbar-hide scroll-smooth overflow-y-scroll snap-y snap-mandatory'>
      <img
        src={imageURL}
        alt={imageURL.slice(imageURL.lastIndexOf('/')+1, imageURL.length - 4)}
        className='w-full h-screen fixed -z-10 object-cover  brightness-50'
      />

      <section className='flex flex-col justify-between h-full py-14 lg:py-14 text-white w-5/6 lg:max-w-7xl mx-auto  snap-start'>
        <section className='flex flex-col gap-5 lg:max-w-lg'>
          <div className='flex items-center gap-5'>
            <q className='text-sm lg:text-base w-4/5'>{quote.content}</q>
            <button onClick={getQuote}>
              <Random />
            </button>
          </div>
          <h2 className='font-bold lg:text-lg'>{quote.author}</h2>
        </section>

        <section className='flex flex-col gap-5 text-white select-none'>
          <h2 className='font-thin uppercase tracking-widest lg:text-5xl'>
            {partOfTheDayText}
          </h2>

          <h1 className='font-bold text-7xl lg:text-9xl'>
            {time}{' '}
            <span className='font-thin text-xl lg:text-3xl'>
              {timezone.abbr}
            </span>
          </h1>

          
          <h2 className='font-thin uppercase tracking-widest lg:text-3xl'>
            in {timezone.timezone}
          </h2>
        </section>
      </section>

      <section className='text-white bg-[rgba(0,0,0,.75)] select-none snap-start'>
        <div className='w-5/6 lg:max-w-7xl mx-auto flex flex-col gap-8 py-14 lg:flex-row lg:gap-0 lg:divide-x'>
          <div className='flex flex-col gap-8 lg:flex-1 lg:gap-14 font-normal text-sm uppercase lg:tracking-widest'>
              <h3 className='flex justify-between items-center lg:flex-col lg:justify-start lg:items-start lg:text-base lg:gap-3'>
                date
                <span className='font-extrabold text-base lg:text-3xl normal-case'>
                  {date.date}
                </span>
              </h3>
              <h3 className='flex justify-between items-center lg:flex-col lg:justify-start lg:items-start lg:text-base lg:gap-3'>
                nameday
                <span className='font-extrabold text-base lg:text-3xl normal-case'>
                  {nameday}
                </span>
              </h3>
              <h3 className='flex justify-between items-center lg:flex-col lg:justify-start lg:items-start lg:text-base lg:gap-3'>
                weather{' '}
                <span className='font-extrabold text-base lg:text-3xl normal-case'>
                  {weather.temperatureC}°C - {weather.conditionText}{' '}
                  <img
                    src={`${weather.icon}`}
                    alt=''
                    className='h-10 inline-block'
                  />{' '}
                </span>
              </h3>
          </div>

          <div className='flex flex-col gap-8 lg:flex-1 lg:gap-14 font-normal text-sm uppercase lg:tracking-widest lg:pl-28'>
            <h3 className='flex justify-between items-center lg:flex-col lg:justify-start lg:items-start lg:text-base lg:gap-3'>
              day of the week{' '}
              <span className='font-extrabold text-base lg:text-3xl normal-case'>
                {date.day}
              </span>
            </h3>
            <h3 className='flex justify-between items-center lg:flex-col lg:justify-start lg:items-start lg:text-base lg:gap-3'>
              month{' '}
              <span className='font-extrabold text-base lg:text-3xl normal-case'>
                {date.month}
              </span>
            </h3>
          </div>

        </div>
      </section>

      {/* 

      

       */}
    </main>
  );
};

export default App;
