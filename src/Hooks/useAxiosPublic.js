import axios from "axios";

const axiosPublic = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API
})

const useAxiosPublic = () => {
    return axiosPublic;
};

export default useAxiosPublic;