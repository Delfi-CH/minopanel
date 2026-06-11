import axios from 'axios';

export const ssr = false;

export async function load({ params }) {
    const res = await axios.get("http://localhost:6502/api/server/static/" + params.slug)

    return {
        post: res.data
    }
}