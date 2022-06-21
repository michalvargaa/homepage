import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

import { ReactComponent as Random } from './assets/svgs/random.svg';
import { ReactComponent as ArrowLeft } from './assets/svgs/arrow-left.svg';
import sunrise from './assets/backgroundImages/sunrise.jpg';
import afternoon from './assets/backgroundImages/afternoon.jpg';
import evening from './assets/backgroundImages/evening.jpg';
import login from './assets/backgroundImages/login.jpg';

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

interface Location {
  city: string;
  country: string;
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
  const [location, setLocation] = useState<Location>({ city: '', country: '' });

  const [user, setUser] = useState<string>('');
  const userRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);

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

  const getLocationAndWeather = () => {
    const success = async (position: GeolocationPosition) => {
      const weather = await axios.get(
        `http://api.weatherapi.com/v1/current.json?key=${process.env.REACT_APP_API_KEY}&q=${position.coords.latitude},${position.coords.longitude}&aqi=no`
      );
      const location = await axios.get(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
      );

      const weatherData = await weather.data;
      const locationData = await location.data;
      if (weatherData && locationData) {
        setWeather({
          temperatureC: weatherData.current.temp_c,
          temperatureF: weatherData.current.temp_f,
          conditionText: weatherData.current.condition.text,
          icon: weatherData.current.condition.icon,
        });

        setLocation({
          city: locationData.city,
          country: locationData.countryName,
        });
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success);
    }
  };

  const handleLogin = () => {
    if (userRef.current?.value !== '') {
      setUser(userRef.current?.value!);
      localStorage.setItem('user', userRef.current?.value!);
    } else {
      setUser('');
    }
  };

  useEffect(() => {
    // is user logged in ?
    if (localStorage.getItem('user')) {
      setUser(localStorage.getItem('user')!);
    }

    getTime();
    getTimezone();
    getQuote();
    getNameday();
    getLocationAndWeather();

    setDate({
      date: new Intl.DateTimeFormat(navigator.language).format(new Date()),
      day: new Date().toLocaleString('default', { weekday: 'long' }),
      month: new Date().toLocaleString('default', { month: 'long' }),
    });

    const updateEveryMinute = setInterval(() => {
      getTime();
    }, 60000 - new Date().getSeconds() * 1000);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      clearInterval(updateEveryMinute);
      clearTimeout(timer);
    };
  }, []);

  return loading ? (
    <main className='bg-black w-screen fixed h-full grid place-items-center'>
      <h1 className='text-white'>loading...</h1>
    </main>
  ) : user === '' ? (
    <main
      className={`fixed h-full w-screen text-white text-base font-semibold bg-[#020202] transition`}
    >
      <img
        src={login}
        alt='nature'
        className='w-full h-screen fixed -z-10 object-cover brightness-[.25]'
      />

      <section className='h-full flex justify-between  flex-col pt-20 w-10/12 mx-auto'>
        <form className='flex flex-col' onSubmit={handleLogin}>
          <h1 className='text-base font-normal tracking-normal xl:text-2xl'>
            hello, what is your <span className='font-bold'>name?</span>{' '}
          </h1>
          <input
            type='text'
            ref={userRef}
            className='bg-transparent border-b-2 border-white focus:outline-none py-2 w-[180px] mt-6 xl:text-2xl xl:w-[270px]'
            maxLength={10}
            autoFocus
          />
        </form>
        <button className='self-end pb-10 xl:hidden' onClick={handleLogin}>
          <ArrowLeft fill='white' />
        </button>
      </section>
    </main>
  ) : (
    <main className='w-screen absolute h-full  overflow-x-hidden scrollbar-hide  overflow-y-scroll snap-y snap-mandatory transition'>
      <img
        src={imageURL}
        alt={imageURL.slice(imageURL.lastIndexOf('/') + 1, imageURL.length - 4)}
        className='w-full h-screen fixed -z-10 object-cover brightness-50'
      />

      <section className='flex flex-col justify-between h-full py-12 lg:py-14 text-white w-5/6 lg:max-w-7xl mx-auto snap-start'>
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
          <h2 className='font-thbin uppercase tracking-widest lg:text-5xl'>
            {partOfTheDayText}, {user}
          </h2>

          <h1 className='font-bold text-7xl lg:text-9xl'>
            {time}{' '}
            <span className='font-thin text-xl lg:text-3xl'>
              {timezone.abbr}
            </span>
          </h1>

          <h2 className='font-thin uppercase tracking-widest lg:text-3xl'>
            in{' '}
            {location.city !== ''
              ? `${location.city},${' '}${location.country}`
              : `${timezone.timezone}`}
          </h2>
        </section>
      </section>

      <section className='text-white bg-[rgba(0,0,0,.75)] select-none snap-end'>
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
            {weather.conditionText !== '' && (
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
            )}
          </div>

          <div className='flex flex-col gap-8 lg:flex-1 lg:gap-14 font-normal text-sm uppercase lg:tracking-widest lg:pl-28'>
            <h3
              className='flex justify-between items-center lg:flex-col lg:justify-start lg:items-start lg:text-base lg:gap-3'
              translate='no'
            >
              day of the week{' '}
              <span
                className='font-extrabold text-base lg:text-3xl normal-case'
                translate='no'
              >
                {date.day}
              </span>
            </h3>
            <h3
              className='flex justify-between items-center lg:flex-col lg:justify-start lg:items-start lg:text-base lg:gap-3'
              translate='no'
            >
              month{' '}
              <span
                className='font-extrabold text-base lg:text-3xl normal-case'
                translate='no'
              >
                {date.month}
              </span>
            </h3>
          </div>
        </div>
      </section>
    </main>
  );
};

export default App;
