import { axiosClient } from '../../../shared/api/axiosClient'

import type { UserDto } from '../types'

export async function fetchCurrentUser(): Promise<UserDto> {
  const { data } = await axiosClient.get<UserDto>('/api/users/me')
  return data
}
