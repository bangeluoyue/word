import { redirect } from 'next/navigation';

export default function Login() {
  redirect('/mine?auth=login');
}
